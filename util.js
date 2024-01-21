const extractName = (fullname) => {
  const [ name, surname, lastname ] = fullname.trim().split(/\s+/, 3)
  if (lastname) {
    return surname
  }

  return name
}
exports.extractName = extractName

const generateId = (length) => {
  let result             = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}
exports.generateId = generateId


const formatNumber = (number) => {
  if (number < 100) {
    number = 100
  } else if (number > 100 && number < 200) {
    number = 200
  }
  return new Intl.NumberFormat('kz-KZ', { maximumSignificantDigits: 3 }).format(number).replaceAll(',', ' ')
}
exports.formatNumber = formatNumber
