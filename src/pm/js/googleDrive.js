

var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

var CLIENT_ID = '670947367916-e8ivlp27kk81m6p1eg7s962hd67vsr9b.apps.googleusercontent.com';

var INSTALL_SCOPE = 'https://www.googleapis.com/auth/drive.install';
var DEFAULT_SCOPE = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

var DEVELOPER_KEY = 'AIzaSyCwyngJi5vUCkx__na91CVDNdnGetCGH6s';

var the_state = {
    auth_failed: false,
    auth_ready: false,
    signed_in: false,
    ui_integrated: null
};

Object.seal(the_state);

function changeState(change) {
    var something_changed = false;
    $.each(change, function(key, value) {
        if(the_state[key] != value) {
            console.log("google state: " + key + " changed: ", value);
            the_state[key] = value;
            something_changed = true;
        }
    });
    //if(the_state_listener && something_changed)
    //    the_state_listener(the_state);

    $("#btnSighInOut").prop('disabled', !the_state.auth_ready);
    $("#btnGoogleOpen").prop('disabled', !the_state.signed_in);
    //$("#btnGoogleSave").prop('disabled', !the_state.signed_in);
    $("#btnGoogleSaveAs").prop('disabled', !the_state.signed_in);


    $("#btnSighInOut").html(the_state.signed_in ? 'Sign out  <span class="glyphicon glyphicon-log-out"></span>' : 'Sign in  <span class="glyphicon glyphicon-log-in"></span>');
}

var already_initialized = false;
function initGoogleAPI() {
    if(already_initialized)
        return;

    already_initialized = true;

    return new Promise(function(resolve, reject) {
        $.ajax({
            url: "https://apis.google.com/js/api.js",
            cache: true,
            dataType: "script"
        }).then(function() {
            resolve();
        }).fail(function(jqXHR, textStatus) {
            reject("Unable to load Google API: " + textStatus);
        })
    }).then(function() {
        return new Promise(function(resolve, reject) {
            //no way to catch?
            gapi.load("client:auth2:picker", resolve);           
        })
    }).then(function() {
        return new Promise(function(resolve, reject) {
            return gapi.client.init({
                discoveryDocs: DISCOVERY_DOCS,
            }).then(function() {
                resolve();
            }, function(err) {
                console.log("rejected in gapi.client.init", err);
                var msg = err.message;
                reject(msg);
            });
        })
    }).then(function() {
        return new Promise(function(resolve, reject) {
            gapi.auth2.init({
                fetch_basic_profile: false,
                client_id: CLIENT_ID,
                scope: DEFAULT_SCOPE
            }).then(function(auth) {
                var update_signed_in = function(is_signed_in) { changeState({signed_in: is_signed_in}); };
                var update_current_user = function(usr) {
                    changeState({ui_integrated: usr.hasGrantedScopes(INSTALL_SCOPE)});
                }

                changeState({auth_ready: true});

                auth.isSignedIn.listen(update_signed_in);
                auth.currentUser.listen(update_current_user);
                update_signed_in(auth.isSignedIn.get());
                update_current_user(auth.currentUser.get());

                resolve();
            }, function(arg) {
                console.log("rejected in gapi.auth2.init", arg);
                reject(arg.message || arg.error);
            })
        })
    }).then(function() {
        console.log("google initialized Ok");
    }).catch(function(err) {
        console.log("google init failed:", err);

        changeState({auth_failed: true});
    })
}

function btnSighInOut(){
    if(!the_state.signed_in)
        gapi.auth2.getAuthInstance().signIn();
    
    else
        gapi.auth2.getAuthInstance().signOut();//no work, why?    
}

var fileID = "";
//https://github.com/softmonkeyjapan/angular-google-picker/issues/16
function loadFileFromGD() {
    return new Promise(function(resolve, reject) {
        var view = new google.picker.DocsView();
        view.setMode(google.picker.DocsViewMode.LIST);
        view.setQuery("*.pms");

        var appid = CLIENT_ID.substr(0, CLIENT_ID.indexOf("-"));

        var token = getCurrentToken();

        var callback = function(data) {
            if(data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                var doc = data[google.picker.Response.DOCUMENTS][0];
                var id = doc[google.picker.Document.ID];
                resolve(id);
            } else {
                // let's simply not resolve this
                // is it ok? <http://stackoverflow.com/questions/20068467/do-never-resolved-promises-cause-memory-leak>
            }
        }
        //how to delete picker after all?
        var picker = new google.picker.PickerBuilder().
            addView(view).
            setAppId(appid).
            setOAuthToken(token).
            setDeveloperKey(DEVELOPER_KEY).
            enableFeature(google.picker.Feature.NAV_HIDDEN).
            setCallback(callback).
            setTitle("Open a password file").
            build();

        picker.setVisible(true);  
        $(".picker-dialog-content").css({'height': '100%','width': '100%', 'max-width': '566px'});
        $(".picker-dialog").css({'height': '80%', 'width': '96%','max-width': '566px', 'top': '0', 'right': '0', 'bottom': '0', 'left': '0', 'margin': 'auto'});

    }).then(function(id) {
        // size problably not returning by picker, so we will perform call to determine it
        return new Promise(function(resolve, reject) {
            gapi.client.drive.files.get({
                "fileId": id,
                "fields": "name,size"
            }).then(function(x) {
                var sstr = x.result.size;

                if(!sstr)
                    reject("Not a binary file, cannot open");

                resolve({id:id, name:x.result.name});
            }, function(x) {
                console.log(x);
                reject("Unable to get file metadata: " + x.statusText);
            })
        })
    }).then(function(x) {
        return new Promise(function(resolve, reject) {
            gapi.client.drive.files.get({
                "fileId": x.id,
                "alt": "media"
            }).then(function(y) {
                resolve({
                    google_id: x.id,
                    name: x.name,
                    data: y.body
                })
            }, function(x) {
                console.log(x);
                reject("Unable to get file content: " + x.statusText);
            })
        })
    })
}
async function btnGoogleOpen(){
    clearInputs("#fileModelDialog");
    clearInputs("#protectModelDialog");
    $("#mainDiv").html(null);  
    loginList = [];
    editableEntry = -1;
    masterPassword = "";
    fileName = "No name.pms";
    header = { createDate:new Date(), updateDate:new Date(), crypted:false };


    $('.navbar-collapse').collapse('hide');
    $("#fileModelDialog").modal('hide');

    var file = await loadFileFromGD();
    
    fileName = file.name;
    fileID = file.google_id;
    var textFromFileLoaded = file.data;
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

        $("#btnGoogleSave").prop('disabled', false);          
    }
    catch (e) {
        ezBSAlert({
            messageText: "Incorrect password!",
            alertType: "danger"
        });
        console.log(e.toString());
        $("#btnGoogleSave").prop('disabled', true);
        fileName = "No name.pms";
        header = { createDate:new Date(), updateDate:new Date(), crypted:false };   
    }
}
function saveFileToGD(data){
    return new Promise(function(resolve, reject) {
        gapi.client.request({
            'path': 'https://www.googleapis.com/upload/drive/v3/files/' + fileID,
            'method': 'PATCH',
            'params': {'uploadType': 'media'},
            'body': data
        }).then(function(x) {
            console.log(x.body)
            resolve()
        }, function(x) {
            console.log('error updating: ', x)
            reject("Error updating file: " + x.statusText)
        })
    });
}
function btnGoogleSave(){

    $('.navbar-collapse').collapse('hide');
    $("#fileModelDialog").modal('hide');

    var headToWrite = JSON.stringify(header);
    var bodyToWrite = JSON.stringify(loginList);
    if (header.crypted) { bodyToWrite = CryptoJS.AES.encrypt(bodyToWrite, masterPassword); }
    bodyToWrite += " |ysnp| ";
    bodyToWrite += headToWrite;

    saveFileToGD(bodyToWrite).then(function() {
        ezBSAlert({
            type: "alert",
            headerText: "Upload file",
            messageText: "File successfuly saved on GoogleDrive",
            alertType: "success"
        });
    }, function(err) {
        ezBSAlert({
            type: "alert",
            headerText: "Upload file",
            messageText: err,
            alertType: "warning"
        });
    });
}
function saveAsFileToGD(name, data){
    return new Promise(function(resolve, reject) {

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelimiter = "\r\n--" + boundary + "--";
        const contentType = 'application/json';

        var metadata = {
            'name': name,
            'mimeType': contentType
        };

        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n\r\n' +
            data +
            closeDelimiter;

        gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': { 'uploadType': 'multipart' },
            'headers': { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
            'body': multipartRequestBody
        }).then(function(x) {
            console.log(x.body)
            resolve()
        }, function(x) {
            console.log('error create: ', x)
            reject("Error create file: " + x.statusText)
        })
    });
}
async function btnGoogleSaveAs(){
    $('.navbar-collapse').collapse('hide');
    $("#fileModelDialog").modal('hide');

    await ezBSAlert({
        type: "prompt",
        headerText: "Upload file",
        messageText: "Enter the name of the passwords file",
        alertType: "primary",
        inputFieldType: "text",
    }).done(function (e) { fileName = e + ".pms"; });

    var headToWrite = JSON.stringify(header);
    var bodyToWrite = JSON.stringify(loginList);
    if (header.crypted) { bodyToWrite = CryptoJS.AES.encrypt(bodyToWrite, masterPassword); }
    bodyToWrite += " |ysnp| ";
    bodyToWrite += headToWrite;

    saveAsFileToGD(fileName, bodyToWrite).then(function() {
        ezBSAlert({
            type: "alert",
            headerText: "Upload file",
            messageText: "File successfuly saved on GoogleDrive",
            alertType: "success"
        });
    }, function(err) {
        ezBSAlert({
            type: "alert",
            headerText: "Upload file",
            messageText: err,
            alertType: "warning"
        });
    }); 
}

function getCurrentToken() {
    var usr = getCurrentUser();
    if(usr) {
        var auth = usr.getAuthResponse();
        if(auth) {
            var result = auth.access_token;
            return result;
        }
    }
    return null;
}
function getCurrentUser() {
    if(!the_state.auth_ready)
        return null;

    return gapi.auth2.getAuthInstance().currentUser.get();
}