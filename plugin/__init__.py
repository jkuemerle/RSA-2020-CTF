from flask import (
    current_app as app,
    render_template,
    request,
    redirect,
    url_for,
    session,
    Blueprint,
    json,
)
from itsdangerous.exc import BadTimeSignature, SignatureExpired, BadSignature

from CTFd.models import db, Users, Teams, Challenges, Solves, Flags

from CTFd.utils import get_config, get_app_config
from CTFd.utils.decorators import ratelimit
from CTFd.utils import user as current_user
from CTFd.utils import config, validators
from CTFd.utils import email
from CTFd.utils.security.auth import login_user, logout_user
from CTFd.utils.crypto import verify_password
from CTFd.utils.logging import log
from CTFd.utils.decorators.visibility import check_registration_visibility
from CTFd.utils.config.visibility import registration_visible
from CTFd.utils.modes import TEAMS_MODE
from CTFd.utils.security.signing import unserialize
from CTFd.utils.helpers import error_for, get_errors


from CTFd.utils.plugins import override_template
from CTFd.plugins import register_plugin_assets_directory
import os

from CTFd.models import db
from CTFd import utils

from os import environ
import base64
import requests
import hmac
import hashlib
from time import time
import uuid
import urllib.parse
import pprint

from werkzeug.routing import Rule

auth = Blueprint('auth', __name__)

def load(app):
    dir_path = os.path.dirname(os.path.realpath(__file__))
    template_path = os.path.join(dir_path, 'assets', 'register.html')
    override_template('register.html', open(template_path).read())
    app.view_functions['auth.register'] = register
    register_plugin_assets_directory(app, base_path='/plugins/<DIR HERE>/assets/js')
    #challenge_template_path = os.path.join(dir_path, 'assets', 'challenges.html')
    #override_template('challenges.html', open(challenge_template_path).read())
    
def register() : 
    errors = get_errors()
    if request.method != "POST":
        return render_template("register.html", errors=errors)    
    else:
        name = request.form['name']
        email_address = request.form['email']
        password = request.form['password']
        fname = request.form['fname']
        lname = request.form['lname']
        name_len = len(name) == 0
        fname_len = len(fname) == 0
        lname_len = len(lname) == 0
        names = Users.query.add_columns('name', 'id').filter_by(name=name).first()
        emails = Users.query.add_columns('email', 'id').filter_by(email=email_address).first()
        pass_short = len(password) == 0
        pass_long = len(password) > 128
        valid_email = validators.validate_email(request.form['email'])
        team_name_email_check = validators.validate_email(name)
        if email.check_email_is_whitelisted(email_address) is False:
            errors.append(
                "Only email addresses under {domains} may register".format(
                    domains=get_config('domain_whitelist')
                )
            )
        if names:
            errors.append('That user name is already taken')
        if team_name_email_check is True:
            errors.append('Your user name cannot be an email address')
        if emails:
            errors.append('That email has already been used')
        if pass_short:
            errors.append('Pick a longer password')
        if pass_long:
            errors.append('Pick a shorter password')
        if name_len:
            errors.append('Pick a longer user name')
        if fname_len:
            errors.append('Pick a longer user first name')
        if lname_len:
            errors.append('Pick a longer last name')
        if len(errors) > 0:
            return render_template(
                'register.html',
                errors=errors,
                fname=request.form['fname'],
                lname=request.form['lname'],
                name=request.form['name'],
                email=request.form['email'],
                password=request.form['password']
            )
        else:
            with app.app_context():
                user = Users(
                    name=name.strip(),
                    email=email_address.lower(),
                    password=password.strip()
                )
                db.session.add(user)
                db.session.commit()
                db.session.flush()
                login_user(user)
                # do custom registration work here
                fname = fname.strip()
                lname = lname.strip()
                user_email = email_address.lower()
                # end custom registration work
                if config.can_send_mail() and get_config('verify_emails'):  # Confirming users is enabled and we can send email.
                    log('registrations', format="[{date}] {ip} - {name} registered (UNCONFIRMED) with {email}")
                    email.verify_email_address(user.email)
                    db.session.close()
                    return redirect(url_for('auth.confirm'))
                else:  # Don't care about confirming users
                    if config.can_send_mail():  # We want to notify the user that they have registered.
                        email.sendmail(
                            request.form['email'],
                            "You've successfully registered for {}".format(get_config('ctf_name'))
                        )
        log('registrations', "[{date}] {ip} - {name} registered with {email}")
        db.session.close()
        return redirect(request.url_root +  "getStarted" + "?result=" + urllib.parse.quote_plus(web_request.text))


