import _ from "lodash";
import {
  VALIDATION_TYPES,
  ValidationResponse,
  ValidationType,
  Validator,
} from "constants/WidgetValidation";
import moment from "moment";
import {
  WIDGET_TYPE_VALIDATION_ERROR,
  URL_HTTP_VALIDATION_ERROR,
} from "constants/messages";
import { getTextArgValue } from "components/editorComponents/DynamicActionCreator";
const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

export const VALIDATORS: Record<ValidationType, Validator> = {
  [VALIDATION_TYPES.TEXT]: (value: any): ValidationResponse => {
    let parsed = value;
    if (_.isUndefined(value) || value === null) {
      return {
        isValid: true,
        parsed: value,
        message: "",
      };
    }
    if (_.isObject(value)) {
      return {
        isValid: false,
        parsed: JSON.stringify(value, null, 2),
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: text`,
      };
    }
    let isValid = _.isString(value);
    if (!isValid) {
      try {
        parsed = _.toString(value);
        isValid = true;
      } catch (e) {
        console.error(`Error when parsing ${value} to string`);
        console.error(e);
        return {
          isValid: false,
          parsed: "",
          message: `${WIDGET_TYPE_VALIDATION_ERROR}: text`,
        };
      }
    }
    return { isValid, parsed };
  },
  [VALIDATION_TYPES.REGEX]: (value: any): ValidationResponse => {
    const { isValid, parsed, message } = VALIDATORS[VALIDATION_TYPES.TEXT](
      value,
    );

    if (isValid) {
      try {
        new RegExp(parsed);
      } catch (e) {
        return {
          isValid: false,
          parsed: parsed,
          message: `${WIDGET_TYPE_VALIDATION_ERROR}: regex`,
        };
      }
    }

    return { isValid, parsed, message };
  },
  [VALIDATION_TYPES.NUMBER]: (value: any): ValidationResponse => {
    let parsed = value;
    if (_.isUndefined(value)) {
      return {
        isValid: false,
        parsed: 0,
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: number`,
      };
    }
    let isValid = _.isNumber(value);
    if (!isValid) {
      try {
        parsed = _.toNumber(value);
        if (isNaN(parsed)) {
          return {
            isValid: false,
            parsed: 0,
            message: `${WIDGET_TYPE_VALIDATION_ERROR}: number`,
          };
        }
        isValid = true;
      } catch (e) {
        console.error(`Error when parsing ${value} to number`);
        console.error(e);
        return {
          isValid: false,
          parsed: 0,
          message: `${WIDGET_TYPE_VALIDATION_ERROR}: number`,
        };
      }
    }
    return { isValid, parsed };
  },
  [VALIDATION_TYPES.BOOLEAN]: (value: any): ValidationResponse => {
    let parsed = value;
    if (_.isUndefined(value)) {
      return {
        isValid: false,
        parsed: false,
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: boolean`,
      };
    }
    const isBoolean = _.isBoolean(value);
    const isStringTrueFalse = value === "true" || value === "false";
    const isValid = isBoolean || isStringTrueFalse;
    if (isStringTrueFalse) parsed = value !== "false";
    if (!isValid) {
      return {
        isValid: isValid,
        parsed: parsed,
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: boolean`,
      };
    }
    return { isValid, parsed };
  },
  [VALIDATION_TYPES.OBJECT]: (value: any): ValidationResponse => {
    let parsed = value;
    if (_.isUndefined(value)) {
      return {
        isValid: false,
        parsed: {},
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Object`,
      };
    }
    let isValid = _.isObject(value);
    if (!isValid) {
      try {
        parsed = JSON.parse(value);
        isValid = true;
      } catch (e) {
        console.error(`Error when parsing ${value} to object`);
        console.error(e);
        return {
          isValid: false,
          parsed: {},
          message: `${WIDGET_TYPE_VALIDATION_ERROR}: Object`,
        };
      }
    }
    return { isValid, parsed };
  },
  [VALIDATION_TYPES.ARRAY]: (value: any): ValidationResponse => {
    let parsed = value;
    try {
      if (_.isUndefined(value)) {
        return {
          isValid: false,
          parsed: [],
          message: `${WIDGET_TYPE_VALIDATION_ERROR}: Array/List`,
        };
      }
      if (_.isString(value)) {
        parsed = JSON.parse(parsed as string);
      }
      if (!Array.isArray(parsed)) {
        return {
          isValid: false,
          parsed: [],
          message: `${WIDGET_TYPE_VALIDATION_ERROR}: Array/List`,
        };
      }
      return { isValid: true, parsed };
    } catch (e) {
      console.error(e);
      return {
        isValid: false,
        parsed: [],
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Array/List`,
      };
    }
  },
  [VALIDATION_TYPES.TABLE_DATA]: (value: any): ValidationResponse => {
    const { isValid, parsed } = VALIDATORS[VALIDATION_TYPES.ARRAY](value);
    if (!isValid) {
      return {
        isValid,
        parsed,
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Table Data`,
      };
    } else if (!_.every(parsed, datum => _.isObject(datum))) {
      return {
        isValid: false,
        parsed: [],
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Table Data`,
      };
    }
    return { isValid, parsed };
  },
  [VALIDATION_TYPES.CHART_DATA]: (value: any): ValidationResponse => {
    const { isValid, parsed } = VALIDATORS[VALIDATION_TYPES.ARRAY](value);
    if (!isValid) {
      return {
        isValid,
        parsed,
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Chart Data`,
      };
    } else if (!_.every(parsed, datum => _.isObject(datum))) {
      return {
        isValid: false,
        parsed: [],
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Chart Data`,
      };
    }
    return { isValid, parsed };
  },
  [VALIDATION_TYPES.MARKERS]: (value: any): ValidationResponse => {
    const { isValid, parsed } = VALIDATORS[VALIDATION_TYPES.ARRAY](value);
    if (!isValid) {
      return {
        isValid,
        parsed,
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Marker Data`,
      };
    } else if (!_.every(parsed, datum => _.isObject(datum))) {
      return {
        isValid: false,
        parsed: [],
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Marker Data`,
      };
    }
    return { isValid, parsed };
  },
  [VALIDATION_TYPES.OPTIONS_DATA]: (value: any): ValidationResponse => {
    const { isValid, parsed } = VALIDATORS[VALIDATION_TYPES.ARRAY](value);
    if (!isValid) {
      return {
        isValid,
        parsed,
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Options Data`,
      };
    }
    const hasOptions = _.every(parsed, (datum: { label: any; value: any }) => {
      if (_.isObject(datum)) {
        return _.isString(datum.label) && _.isString(datum.value);
      } else {
        return false;
      }
    });
    if (!hasOptions) {
      return {
        isValid: false,
        parsed: [],
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Options Data`,
      };
    }
    return { isValid, parsed };
  },
  [VALIDATION_TYPES.DATE]: (value: any): ValidationResponse => {
    if (value === undefined) {
      const today = new Date();
      today.setHours(0, 0, 0);
      return {
        isValid: false,
        parsed: today,
        message: `${WIDGET_TYPE_VALIDATION_ERROR}: Date`,
      };
    }
    const isValid = moment(value).isValid();
    const parsed = isValid ? moment(value).toDate() : new Date();
    return {
      isValid,
      parsed,
      message: isValid ? "" : `${WIDGET_TYPE_VALIDATION_ERROR}: Date`,
    };
  },
  [VALIDATION_TYPES.ACTION_SELECTOR]: (value: any): ValidationResponse => {
    if (_.isString(value)) {
      if (value.indexOf("navigateToUrl") !== -1) {
        const url = getTextArgValue(value);
        const isValidUrl = URL_REGEX.test(url);
        if (!isValidUrl) {
          return {
            isValid: false,
            parsed: value,
            message: `${URL_HTTP_VALIDATION_ERROR}`,
          };
        }
      }
    }
    return {
      isValid: true,
      parsed: value,
    };
  },
  [VALIDATION_TYPES.ARRAY_ACTION_SELECTOR]: (
    value: any,
  ): ValidationResponse => {
    const { isValid, parsed, message } = VALIDATORS[VALIDATION_TYPES.ARRAY](
      value,
    );
    let isValidFinal = isValid;
    let finalParsed = parsed.slice();
    if (isValid) {
      finalParsed = parsed.map((value: any) => {
        const { isValid, message } = VALIDATORS[
          VALIDATION_TYPES.ACTION_SELECTOR
        ](value.dynamicTrigger);

        isValidFinal = isValidFinal && isValid;
        return {
          ...value,
          message: message,
          isValid: isValid,
        };
      });
    }

    return {
      isValid: isValidFinal,
      parsed: finalParsed,
      message: message,
    };
  },
};
