export const GetIndex = (elem) => {
    for (var i = 0; i < elem.parentNode.childNodes.length; i++) {
      if (elem.parentNode.childNodes[i] === elem) {
        return i;
      }
    }
  }