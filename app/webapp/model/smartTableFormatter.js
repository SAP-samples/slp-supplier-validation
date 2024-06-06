sap.ui.define(function () {
    return {
          Status: function (iNo) {
                 if (iNo != 'Event Published') {
                       return sap.ui.core.ValueState.Warning;
                  } else {
                        return sap.ui.core.ValueState.Success;
                }
           }
   };
});