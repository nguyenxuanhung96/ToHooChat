var sweetAlertF = (function (){
  let success = (m) => swal(m, "", "success");
  let error = (m) => swal(m, "", "error");
  let warning = (m) => swal(m, "", "warning");

  let factory = {
    success: success,
    error: error,
    warning: warning,
  };
  return factory;
})();
