var header = { createDate: new Date(), updateDate: new Date(), crypted:false };
var loginList = [];
var editableEntry = -1;
var masterPassword = "";
var fileName = "No name.pms";

// entry buttons
function btnShowHidePassword (id) {
    $("#password" + id).attr('type', $("#password" + id).attr('type') == 'password' ? 'text' : 'password');
    $("#btnCopyPass" + id).html($("#password" + id).attr('type') == 'password' ? '<span class="glyphicon glyphicon-eye-open"></span>' : '<span class="glyphicon glyphicon-eye-close"></span>')  
}
function btnCopyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select().focus();
    document.execCommand("copy");
    $temp.remove();
    $(element).focus();
}
function btnEntrySave() {
    if (editableEntry == -1) {
        addEntry($("#nameEntry").val(), $("#loginEntry").val(), $("#passwordEntry").val(), $("#commentEntry").val());
    }
    else {
        updateEntry(editableEntry, $("#nameEntry").val(), $("#loginEntry").val(), $("#passwordEntry").val(), $("#commentEntry").val());
    }    
    btnEntryClose();
    updateFileHeader();
}
function btnEntryClose() {
    editableEntry = -1;
    $("#entryModelDialog").modal('hide');
    clearInputs("#entryModelDialog");
    $("#btnDelEntry").addClass('hide');
    if($("#passwordEntry").attr('type') == 'text'){
        btnShowHidePassword("Entry");}    
    $('.navbar-collapse').collapse('hide');
    $("#genPassword").collapse('hide');
}
function btnEntryDel() {
    if (editableEntry != -1) {
        ezBSAlert({
            type: "confirm",
            headerText: "Ahtung!!!",
            messageText: "Are you sure to delete this account?",
            alertType: "danger",
        }).done(function (e) {
            if (e === true) {
                loginList.splice(editableEntry, 1);
                $("#mainDiv").html(null);
                $.each(loginList, function (i, e) { drawEntry(i, e.n, e.l, e.p, e.c); });
            }
        });        
    }
    btnEntryClose();
    updateFileHeader();
}
function modelEntryKeyUp(e){
    if (e.keyCode === 13) {
        if (!$("#commentEntry").is(":focus"))
            $("#btnSaveEntry").click();             
    }
    else if(e.keyCode === 27){
        btnEntryClose();
    }
}
function btnPassLength(s) {
    switch (s) {
        case '-':
            $("#passLength").text($("#passLength").text() - 1);
            break;
        case '+':
            $("#passLength").text($("#passLength").text() - 0 + 1);
            break;
    }
    if ($("#passLength").text() - 0 < 6)
        $("#passLength").text(6);
    if ($("#passLength").text() - 0 > 26)
        $("#passLength").text(26);

    btnGeneratePass();
}
function btnGeneratePass() {

    var az = $("#opaz").hasClass("active");
    var AZ = $("#opAZ").hasClass("active");
    var NN = $("#opNN").hasClass("active");
    var SS = $("#opSS").hasClass("active"); 
    var ln = $("#passLength").text();
    $("#passwordEntry").val(generatePassword(az, AZ, NN, SS, ln));
}

//entry function
function addEntry(n, l, p, c) {
    var entryTemp = {
        n: n,
        l: l,
        p: p,
        c: c
    };
    loginList.push(entryTemp);
    delete this.entryTemp; 
    drawEntry(loginList.length - 1, n, l, p);
}
function drawEntry(i, n, l, p) {
    $("#mainDiv").append(returnEntryDiv(i, n, l, p)); 
}
function updateEntry(i, n, l, p, c) {
    loginList[i].n = n;
    loginList[i].l = l;
    loginList[i].p = p;
    loginList[i].c = c;

    $("#name" + i).text(n);
    $("#login" + i).val(l);
    $("#password" + i).val(p);
}
function expandEntry(i) {
    $("#entryModelDialog").modal('show');
    $("#btnDelEntry").removeClass('hide');
    $("#nameEntry").val(loginList[i].n);
    $("#loginEntry").val(loginList[i].l);
    $("#passwordEntry").val(loginList[i].p);
    $("#commentEntry").val(loginList[i].c);
    editableEntry = i;
    setTimeout(function() { $("#nameEntry").focus()}, 2);
}
function returnEntryDiv(i, n, l, p) {
    return '<div class="col-md-12" id="entryDiv'+i+'" style="padding-top: 4px; padding-bottom: 4px;">'+                  
        ' <fieldset id= "fieldset" class="col-md-10 col-md-offset-1" >' +
        '     <legend id="name' + i + '">' + n + '</legend>' +
        '     <div class="form-inline">' +
        '         <div class="form-group pull-right" style="padding-left: 4px; padding-right: 2px;">' +
        '             <button type="button" class="btn btn-primary" onclick="expandEntry(' + i + ')"><span class="glyphicon glyphicon-cog"></span></button>' +
        '         </div>' +
        '         <div class="col-sm-5 col-md-5 input-group form-group">' +
        '             <input type="text" class="form-control" placeholder="Login" id="login' + i + '" value="' + l +'" readonly/>' +
        '             <span class="input-group-btn">' +
        '                 <button type="button" class="btn btn-primary" onclick = "btnCopyToClipboard(\'#login' + i +'\')"><span class="glyphicon glyphicon-duplicate"></span></button>' +
        '             </span>' +
        '         </div>' +
        '         <div class="col-sm-6 col-md-6 input-group form-group">' +
        '             <input type="password" class="form-control" placeholder="Password" id="password' + i + '" value="' + p + '" readonly/>' +
        '             <span class="input-group-btn">' +
        '                 <button type="button" class="btn btn-primary" onclick = "btnCopyToClipboard(\'#password' + i +'\')"><span class="glyphicon glyphicon-duplicate"></span></button>' +
        '                 <button type="button" class="btn btn-primary" style="width: 48px;" id="btnCopyPass' + i + '" onclick = "btnShowHidePassword(\'' + i +'\')"><span class="glyphicon glyphicon-eye-open"></span></button>' +
        '             </span>' +
        '         </div>' +
        '     </div>  ' +
        ' </fieldset >' +
        '</div>';    
}
function clearInputs(target) {
    $(target).find(':input').each(function () {
        switch (this.type) {
            case 'password':
            case 'select-multiple':
            case 'select-one':
            case 'text':
            case 'textarea':
                $(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
                break;
            case 'file':
                $(this).val(null);

        }
    });
}
function generatePassword(useLower, useUpper, useNumbers, useSymbols, length) {
    var possible = '';
    if (useLower) { possible += 'abcdefghijklmnopqrstuvwxyz'; }
    if (useUpper) { possible += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; }
    if (useNumbers) { possible += '0123456789'; }
    if (useSymbols) { possible += '![]{}()%&*$#^<>~@|'; }

    var pass = '';
    for (var i = 0; i < length; i++) {
        pass += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return pass;
}


//navbar buttons
function btnSearchEntry() {
    var sn = $("#searchName").val();
    $('legend').each(function (i, e) {
        var dfdf = $(e).text();
        if ($(e).text().toLowerCase().indexOf(sn.toLowerCase()) >= 0) {
            $("#entryDiv" + i).removeClass('hide');
        }
        else if ($(e).attr('id') != "name" + i) {
            console.log('WTFK!!! legend#: ' + i + '; id = ' + $(e).attr('id'));
        }
        else {
            $("#entryDiv" + i).addClass('hide');
        }
        
    });
    $("#searchName").val(null);
    $("#searchName").attr('placeholder', 'Search for empty to return');
    $('.navbar-collapse').collapse('hide');
}

////file dialog
function btnFileOpen() {
    clearInputs("#fileModelDialog");
    clearInputs("#protectModelDialog");
    $("#mainDiv").html(null);  
    loginList = [];
    editableEntry = -1;
    masterPassword = "";
    fileName = "No name.pms";
    header = { createDate:new Date(), updateDate:new Date(), crypted:false };

    if ('FileReader' in window) {
        $("#btnInputFile").click(); 
    } else {
        ezBSAlert({
            messageText: "Your browser does not support the HTML5 FileReader.",
            alertType: "danger"
        });
    }

    $('.navbar-collapse').collapse('hide');
    $("#fileModelDialog").modal('hide');
}
function btnInputFileChange(event) {
    var fileToLoad = event.target.files[0];   
    
    if (fileToLoad) {
        var reader = new FileReader();
        reader.onload = async function (fileLoadedEvent) {
            var textFromFileLoaded = fileLoadedEvent.target.result;
            var decryptedHead = "";
            var decryptedBody = "";            
            try {
                decryptedHead = textFromFileLoaded.split(" |ysnp| ", 2)[1];
                decryptedBody = textFromFileLoaded.split(" |ysnp| ", 2)[0];

                header = JSON.parse(decryptedHead);
                
                if (header.crypted) {
                    //Ask for password
                    await ezBSAlert({
                        type: "prompt",
                        headerText: "This file is password protected",
                        messageText: "Enter master password",
                        alertType: "primary",
                        inputFieldType: "password",
                    }).done(function (e) { masterPassword = e; });

                    decryptedBody = CryptoJS.AES.decrypt(decryptedBody, masterPassword).toString(CryptoJS.enc.Utf8);                    
                }
                
                loginList = JSON.parse(decryptedBody);

                $.each(loginList, function (i, e) { drawEntry(i, e.n, e.l, e.p, e.c); });  

                fileName = fileToLoad.name;//.slice(0,-4);            
            }
            catch (e) {
                ezBSAlert({
                    messageText: "Incorrect password!",
                    alertType: "danger"
                });
                console.log(e.toString());

                fileName = "No name.pms";
                header = { createDate:new Date(), updateDate:new Date(), crypted:false };
            }
        };
        reader.readAsText(fileToLoad, 'UTF-8'); 
     
    }   
}
function btnFileSave() {
    if ('Blob' in window) {
        //if (fileName.indexOf(".pms") == -1){fileName = "pass.pms";}

        var headToWrite = JSON.stringify(header);
        var bodyToWrite = JSON.stringify(loginList);

        if (header.crypted) { bodyToWrite = CryptoJS.AES.encrypt(bodyToWrite, masterPassword); }
        bodyToWrite += " |ysnp| ";
        bodyToWrite += headToWrite;

        var textFileAsBlob = new Blob([bodyToWrite], { type: 'text/plain' });

        if ('msSaveOrOpenBlob' in navigator) {
            navigator.msSaveOrOpenBlob(textFileAsBlob, fileName);
        } else {
            var downloadLink = document.createElement('a');
            downloadLink.download = fileName;
            downloadLink.innerHTML = 'Download File';
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);            

            downloadLink.click();
            delete this.downloadLink;
        }
        
    } else {
        ezBSAlert({
            messageText: "Your browser does not support the HTML5 Blob.",
            alertType: "danger"
        });
    }
    $('.navbar-collapse').collapse('hide');
    $("#fileModelDialog").modal('hide');
}


////protect dialog
function btnGetPassword() {
    var pas1 = "";
    var pas2 = "";
    $('.navbar-collapse').collapse('hide');
    ezBSAlert({
        type: "prompt2",
        headerText: masterPassword == "" ? "This file isn't password protected" : "This file is password protected",
        messageText: masterPassword == "" ? "Input master password" : "Input new master password",
        alertType: "primary",
        inputFieldType: "password",
    }).done(function (e) { 
        if(!(e === false)) {
            pas1 = e;
            if(pas1 != ""){
                ezBSAlert({
                    type: "prompt2",
                    headerText: masterPassword == "" ? "This file isn't password protected" : "This file is password protected",
                    messageText: masterPassword == "" ? "Repeat master password" : "Repeat new master password",
                    alertType: "primary",
                    inputFieldType: "password",
                }).done(function (e) { 
                    if(!(e === false)){ 
                        pas2 = e; 
                        if(pas1==pas2){
                            masterPassword = pas1;
                            updateFileHeader();  
                            ezBSAlert({
                            type: "alert",
                            headerText: "Password protection",
                            messageText: "Password has been successfully changed",
                            alertType: "success"
                            });
                        }
                        else{
                            ezBSAlert({
                                type: "alert",
                                headerText: "Password protection",
                                messageText: "Entered passwords do not match",
                                alertType: "warning"
                            });
                        }
                    }
                });        
            }
            else{
                masterPassword = "";
                updateFileHeader();  
                ezBSAlert({
                    type: "alert",
                    headerText: "Password protection",
                    messageText: "Password was successfully reset",
                    alertType: "success"
                });
            }
        }  
    });    
}


//file header
function updateFileHeader(){
    var h = "Creation date: ";
    if(header.createDate == "no"){ header.createDate = new Date(); }
    header.updateDate = new Date();
    header.crypted = masterPassword != "";
    
    //showFileHeader();
}
function showFileHeader(){
    var h = "File name: ";
    h += fileName;
    h += "<br> Creation date: ";
    h += new Date(header.createDate).toLocaleString();
    h += "<br> Updated date: ";
    h += new Date(header.updateDate).toLocaleString();
    h += "<br> Protection: ";
    h += header.crypted;
    h += "<p></p>";
    
    $(".file-info").html(h);
}


//promt/alert/confirm by ezanker (https://www.bootply.com/PoVEEtvPZt)
function ezBSAlert(options) {
    var deferredObject = $.Deferred();
    var defaults = {
        type: "alert", //alert, prompt,confirm 
        modalSize: 'modal-sm', //modal-sm, modal-lg
        okButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        yesButtonText: 'Yes',
        noButtonText: 'No',
        headerText: 'Attention',
        messageText: 'Message',
        alertType: 'default', //default, primary, success, info, warning, danger
        inputFieldType: 'text', //could ask for number,email,etc
    }
    $.extend(defaults, options);

    var _show = function () {
        var headClass = "navbar-default";
        switch (defaults.alertType) {
            case "primary":
                headClass = "alert-primary";
                break;
            case "success":
                headClass = "alert-success";
                break;
            case "info":
                headClass = "alert-info";
                break;
            case "warning":
                headClass = "alert-warning";
                break;
            case "danger":
                headClass = "alert-danger";
                break;
        }
        $('BODY').append(
            '<div id="ezAlerts" tabindex="0" class="modal fade">' +
            '<div class="modal-dialog" class="' + defaults.modalSize + '">' +
            '<div class="modal-content">' +
            '<div id="ezAlerts-header" class="modal-header ' + headClass + '">' +
            //'<button id="close-button" type="button" class="close" data-dismiss="modal"> <span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
            '<h4 id="ezAlerts-title" class="modal-title">Modal title</h4>' +
            '</div>' +
            '<div id="ezAlerts-body" class="modal-body">' +
            '<div id="ezAlerts-message" ></div>' +
            '</div>' +
            '<div id="ezAlerts-footer" class="modal-footer">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );

        $('.modal-header').css({
            'padding': '15px 15px',
            '-webkit-border-top-left-radius': '5px',
            '-webkit-border-top-right-radius': '5px',
            '-moz-border-radius-topleft': '5px',
            '-moz-border-radius-topright': '5px',
            'border-top-left-radius': '5px',
            'border-top-right-radius': '5px'
        });

        $('#ezAlerts-title').text(defaults.headerText);
        $('#ezAlerts-message').html(defaults.messageText);

        var keyb = "false", backd = "static";
        var calbackParam = "";
        switch (defaults.type) {
            case 'alert':
                keyb = "true";
                backd = "true";
                $('#ezAlerts-footer').html('<button id="ezok-btn" class="btn btn-' + defaults.alertType + '">' + defaults.okButtonText + '</button>').on('click', ".btn", function () {
                    calbackParam = true;
                    $('#ezAlerts').modal('hide');
                });            
                break;
            case 'confirm':           
                var btnhtml = '<button id="ezok-btn" class="btn btn-primary">' + defaults.yesButtonText + '</button>';
                if (defaults.noButtonText && defaults.noButtonText.length > 0) {
                    btnhtml += '<button id="ezclose-btn" class="btn btn-default">' + defaults.noButtonText + '</button>';
                }
                $('#ezAlerts-footer').html(btnhtml).on('click', 'button', function (e) {
                    if (e.target.id === 'ezok-btn') {
                        calbackParam = true;
                        $('#ezAlerts').modal('hide');
                    } else if (e.target.id === 'ezclose-btn') {
                        calbackParam = false;
                        $('#ezAlerts').modal('hide');
                    }
                });
                break;
            case 'prompt':
                $('#ezAlerts-message').html(defaults.messageText + '<br /><br /><div class="form-group"><input type="' + defaults.inputFieldType + '" class="form-control" id="prompt" /></div>');
                $('#ezAlerts-footer').html('<button id="ezok-btn" class="btn btn-primary">' + defaults.okButtonText + '</button>').on('click', ".btn", function () {
                    calbackParam = $('#prompt').val();
                    $('#ezAlerts').modal('hide');
                });
                break;
            case 'prompt2':
                $('#ezAlerts-message').html(defaults.messageText + '<br /><br /><div class="form-group"><input type="' + defaults.inputFieldType + '" class="form-control" id="prompt" /></div>');
                var btnhtml = '<button id="ezclose-btn" class="btn btn-default">' + defaults.cancelButtonText + '</button>';
                btnhtml += '<button id="ezok-btn" class="btn btn-primary">' + defaults.okButtonText + '</button>';    
                $('#ezAlerts-footer').html(btnhtml).on('click', 'button', function (e) {
                    if (e.target.id === 'ezok-btn') {
                        calbackParam = $('#prompt').val();
                        $('#ezAlerts').modal('hide');
                    } else if (e.target.id === 'ezclose-btn') {
                        calbackParam = false;
                        $('#ezAlerts').modal('hide');
                    }
                });
                break;
        }
        $('#ezAlerts').on("keyup", function (e) {
            if (e.keyCode === 13) {
                $('#ezok-btn').click();                
            }
            else if(e.keyCode === 27){
                $('#ezclose-btn').click();  
            }
        });
        $('#ezAlerts').modal({
            show: false,
            backdrop: backd,
            keyboard: keyb
        }).on('hidden.bs.modal', function (e) {
            $('#ezAlerts').remove();
            deferredObject.resolve(calbackParam);
        }).on('shown.bs.modal', function (e) {
            if ($('#prompt').length > 0) {
                $('#prompt').focus();
            }
        }).modal('show');
    }

    _show();
    return deferredObject.promise();
}
