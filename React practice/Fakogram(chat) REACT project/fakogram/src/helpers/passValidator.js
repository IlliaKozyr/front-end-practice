export const passValidator = (password, passwordAgain, n = "8") => {
    if (password === passwordAgain) {
        return (
            password.length >= n &&
            (/[a-zа-яё]/ && /[A-ZА-ЯЁ]/ && /[\d]/).test(password)
        );
    } else {
        return false
    }
};
