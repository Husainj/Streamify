export const extractErrorMessage = (htmlString) => {
    const match = htmlString.match(/<pre>(Error:.*?)<br>/);
    return match ? match[1].trim() : 'An unexpected error occurred';
  };