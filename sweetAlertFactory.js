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
var toatrAlerF = (function(){
  let success = (m) => toastr.success(m);
  let error = (m) => toastr.error(m);
  let warning = (m) => toastr.warning(m);
  let info = (m) => toastr.info(m);
  let factory = {
    success: success,
    error: error,
    warning: warning,
    info: info,
  };
  return factory;
})();