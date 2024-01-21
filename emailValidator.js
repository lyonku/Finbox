const { Api } = require('zerobounce');

const api = new Api('99f9dd66b47c4e09ba1125d9cad681ba');

const emailValidator = async (email) => {
  try {
    const response = await api.validate(email)
    if (response.isSuccess()) {
      if (response.success?.status === 'valid' || response.success?.status === 'unknown') {
        return {
          status: response.success.status
        };
      }

      console.log('the email address', email, 'is', response.success?.status);

      return {
        status: 'invalid',
        didYouMean: response.success?.didYouMean,
      };
    } else if (response.isError()) {
      console.error('the api returned following error', response.error?.error);

      return {
        status: 'unknown'
      };
    }
  } catch (error) {
    console.log('unable to fetch data from server', error);
  }

  return {
    status: 'unknown'
  };
};

exports.emailValidator = emailValidator;
