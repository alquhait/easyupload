

var easyUpload =  {
    messages: {
        moreThanTen: 'لايمكنك اضافاة اكثر من عشر صور',
        saving: 'جاري الحفظ...',
        emptyFiles: 'لايوجد ملفات لرفعها',
        saved: 'تم الحفظ...'
    },
    current_count: 0,
    fileList: {},
    debug: true,
    data: {},
    form: "#uploadPhotos",
    input: "#photos",
    enough: false,
    ajaxOptions: {
        url: window.location.href,
        type: "POST"
    },
    init: function(options) {
        this.debug = options.debug === 'undefined'? false: options.debug;
        this.form = 'form' in options? options.form: this.form;
        this.input = 'input' in options? options.input: this.input;
        this.data = 'data' in options? options.data: this.data;
        this.current_count = 'current_count' in options? options.current_count: this.current_count;
        
        if ('ajax' in options) {
            this.ajaxOptions.url = 'url' in options.ajax? window.location.origin + '/' + options.ajax.url: this.ajaxOptions.url;
            this.ajaxOptions.type = 'type' in options.ajax? options.ajax.type: this.ajaxOptions.type;
        }

        return this;
    },
    supported: function() {
        return window.File && window.FileList && window.FileReader;
    },
    randomstr: function() {
        return Math.random().toString(32).substring(7);
    },
    log: function(msg) {
        if (this.debug) console.log(msg);
    },
    run: function() {
        var c = this;
        if (this.supported()) {
            $(this.input).on('change', function(e) {
                var files = e.target.files;
                var len = files.length;
                for (var i = 0; i < len; i++) {
                    var f = files[i];
                    var key = c.randomstr();
                    c.fileList[key] = files[i];
                    var fr = new FileReader();
                    fr.fileIndex = key;

                    fr.onload = (function(e) {
                        c.log('on load');
                        var file = e.target;
                        c.render(e, file);
                    });
                    fr.readAsDataURL(f);
                }
            });
            this.send();
        }
    },
    render: function(e, file) {
        var i = file.fileIndex;
        return $(this.openSpan() +
                this.img(i, file, e) +
                this.removeSpan(i) +
                this.closeSpan())
                .insertAfter("#result");
                    /*
                    "<img index=" + i + " class=\"imageThumb\" src=\"" + e.target.result + "\" title=\"" + file.name + "\"/>" +
                    "<br/><span onclick=\"this.removeImage(" + 'this' + ', ' + '\'' + i + '\'' + ")\" class=\"remove\">X</span>" +
                    "</span>").insertAfter("#result");
                    */
    },
    openSpan: function() {
        return "<span class='pip'>";
    },
    closeSpan: function() {
        return "</span>";
    },
    img: function(i, file, e) {
        return "<img index=" + i + " onclick=\"showImageModel(this)\" class='imageThumb' src=\"" +
            e.target.result + "\" title=\"" + file.name + "\"/>";
    },
    removeSpan: function(i) {
        return "<br/><span onclick=\"easyUpload.removeImage(" +
            'this' + ', ' + '\'' +
            i + '\'' + ")\" class=\"remove\" title='remove'>X</span>";
    },
    removeImage: function(c, i) {
        //var i = $(c).parent('.pip').find('img').attr('index');
        //this.log(i);
        delete this.fileList[i];
        //fileList.splice(i, 1);
        $(c).parent(".pip").remove();
    },
    send: function(form) {
        var c = this;
        $(this.form).on('submit', function(e) {
            e.preventDefault();

            if (!$.isEmptyObject(c.fileList)) {

                if (c.moreThanTen()) {
                   alert(c.messages.moreThanTen);
                   return;
                }

                $('#save-submit').text(c.messages.saving);

                $.each(c.fileList, function(i, file) {
                    var fd = new FormData();
                    fd.append('photos[]', file);

                    if (!$.isEmptyObject(c.data)) {
                        $.each(c.data, function(key, val) {
                            fd.append(key, val);
                        });
                    }
                    c.ajax(c.ajaxOptions.url, fd, c.ajaxOptions.type);
                });
                setTimeout(function() {
                    $('#save-submit').text(c.messages.saved);
                    location.reload();
                }, 2000);
            } else {
                alert(c.messages.emptyFiles);
            }
        });
    },
    moreThanTen: function() {
        var currentcount = this.current_count;
        var newCount = Object.keys(this.fileList).length;
        return parseInt(currentcount) + parseInt(newCount) > 10;
    },
    ajax: function(url, data, type) {
        var c = this;
        $.ajax({
            url: url,
            data: data,
            type: type,
            contentType: false,
            cache: false,
            processData:false,
            mimeType:"multipart/form-data"
        })
        .done(function(res) { //
            c.log(res);


            //$('#photosHolder').html('');
            //$('#photosHolder').append('<p id="result"></p>');
            //this.fileList = {};
            //$('#uploadPhotos')[0].reset();
            //window.setTimeout(function(){location.reload()}, 3000);
            //window.location.reload();
        });
    }
}

var options = {
    form: "#uploadPhotos",
    input: "#photos",
    debug: true,
    data: {
        _token: $('input[name="_token"]').val()
    },
    current_count: $("#photoCount").attr("count")
    //ajax: {
    //  url: 'listing/36/upload-photos',
    //  type: 'POST',
    //}
};

easyUpload.init(options).run();
