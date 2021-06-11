export const REGEXP = {
    URL: (isEmptyValueAllowed = false) => {
        return new RegExp(
            `((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+\\$,\\w]+@)[A-Za-z0-9.-]+)((?:\\/[\\+~%\\/.\\w-_]*)?\\??(?:[-\\+=&;%@.\\w_]*)#?(?:[\\w]*))?)${
                isEmptyValueAllowed ? '|^$' : ''
            }`
        );
    },
    AT_LEAST_ONE_CHARACTER: (isEmptyValueAllowed = false) => {
        return new RegExp(`(.*[^ ].*)${isEmptyValueAllowed ? '|^$' : ''}`);
    }
};
