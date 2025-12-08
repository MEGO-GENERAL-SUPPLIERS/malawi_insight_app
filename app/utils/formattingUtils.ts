export const formattingUtils = {
  
  sanitizeStringValue(val: any): string {
    if (typeof val !== 'string') return val ?? '';
    if (val.length >= 2 && val.startsWith('"') && val.endsWith('"')) {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'string') return parsed;
      } catch (e) {
        // Not valid JSON, keep original
      }
    }
    return val;
  },


  snakeCaseToCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  },


  camelCaseToSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2") // insert underscore between lowercase-uppercase
      .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2") // handle consecutive capitals (e.g., "XMLHttp" → "xml_http")
      .toLowerCase();
  },


  camelCaseToSnakeCaseObjectKeys(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(this.camelCaseToSnakeCaseObjectKeys);
    }

    if (typeof obj === "object") {
      const converted: Record<string, any> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const newKey = this.camelCaseToSnakeCase(key);
          converted[newKey] = this.camelCaseToSnakeCaseObjectKeys(obj[key]);
        }
      }
      return converted;
    }

    return obj;
  }, 

  
  snakeCaseToCamelCaseObjectKeys(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(this.snakeCaseToCamelCaseObjectKeys);
    }

    if (typeof obj === "object") {
      const converted: Record<string, any> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const newKey = this.snakeCaseToCamelCase(key);
          converted[newKey] = this.snakeCaseToCamelCaseObjectKeys(obj[key]);
        }
      }
      return converted;
    }

    return obj;
  }
};