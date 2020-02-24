var userFactory = (function () {
  let key = "currentUser";
  let getUser = () => {
    let u = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (u) {
      return JSON.parse(u);
    }
    return undefined;
  };
  let setUser = (user, remember) => {
    let json = JSON.stringify(user);
    let u = sessionStorage.getItem(key);
    if (u) {
      sessionStorage.setItem(key, json);
      return true;
    }
    else {
      u = localStorage.getItem(key);
      if (u) {
        localStorage.setItem(key, json);
        return true;
      }
    }
    if (remember) {
      localStorage.setItem(key, json);
    } else {
      sessionStorage.setItem(key, json);
    }
  }
  let clearUser = () => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
  let isLogin = () => {
    let u = getUser();
    return typeof u !== 'undefined';
  }
  let factory = {
    getUser: getUser,
    setUser: setUser,
    logout: clearUser,
    isLogin: isLogin,
  };
  return factory;
})();