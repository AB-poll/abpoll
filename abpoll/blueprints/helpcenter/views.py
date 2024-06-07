from flask import Blueprint, render_template, request, flash, redirect, url_for
from abpoll.blueprints.helpcenter.forms import ContactForm


helpcenter = Blueprint("helpcenter", __name__, template_folder="templates")


@helpcenter.route("/help-center")
def help_center():
    # return redirect(url_for("helpcenter.support"))
    return render_template("helpcenter/overview.html")


@helpcenter.route("/frequently-asked-questions")
def faq():
    # return redirect(url_for("helpcenter.support"))
    return render_template("helpcenter/faqs.html")


@helpcenter.route("/guides")
def guides():
    # return redirect(url_for("helpcenter.support"))
    return render_template("helpcenter/guides.html")


@helpcenter.route("/support-request", methods=["POST", "GET"])
def support():
    form = ContactForm()
    if form.validate_on_submit():
        ctx = {
            "first_name": request.form.get("your_name"),
            "email": request.form.get("email"),
            "subject": request.form.get("subject"),
            "message": request.form.get("your_message"),
        }
        from abpoll.blueprints.helpcenter.tasks import send_contact_email

        send_contact_email(ctx)

        statement = "Request Submitted Successfully"
        description = "One of our associates will get back to you as soon as possible, or if you need urgent help you can always tweet to us on twitter <a rel='_blank' href='https://twitter.com/abpoll'>@abpoll</a>"

        return render_template("errors/thankyou.html", statement=statement, description=description)

    return render_template("helpcenter/support-request.html", form=form)
