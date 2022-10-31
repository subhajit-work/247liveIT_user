(function ($) {
    "use strict";
   
    $("#contactForm").validator().on("submit", function (event) {
        if (event.isDefaultPrevented()) {
            formError();
            submitMSG(false, "Did you fill in the form properly?");
        } else {
            event.preventDefault();
            submitForm(event.target);
        }
    });

    function submitForm(form) {
        var name = $("#name").val();
        var email = $("#email").val();
        var msg_subject = $("#msg_subject").val();
        var phone_number = $("#phone_number").val();
        var message = $("#message").val();

        const submitBtn = $(form).find('[type=submit]');
        $.ajax({
            type: "POST",
            url: $("#contactForm").attr('action'),
            // data: "full_name=" + name + "&email=" + email + "&subject=" + msg_subject + "&mobile=" + phone_number + "&message=" + message,
            data: $(form).serialize(),
            beforeSend: function () {
                submitBtn.attr('disabled', true);
            },
            success: function (response) {
                showToast('Mail has been sent Successfully.');
                $("#contactForm")[0].reset();
            },
            complete: function () {
                submitBtn.attr('disabled', false);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                showToast(errHandling(jqXhr, textStatus), false);
            }
        });
    }

    function formSuccess() {
        $("#contactForm")[0].reset();
        submitMSG(true, "Message Submitted!")
    }

    function formError() {
        $("#contactForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass();
        });
    }

    function submitMSG(valid, msg) {
        if (valid) {
            var msgClasses = "h4 tada animated text-success";
        } else {
            var msgClasses = "h4 text-danger";
        }
        $("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
    }
}(jQuery));