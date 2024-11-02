from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from app import db, bcrypt
from app.models import User, Task
from app.forms import RegistrationForm, LoginForm, ResetPasswordForm, TaskForm

main = Blueprint('main', __name__)

@main.route("/")
@main.route("/home")
@login_required
def home():
    # Mengambil semua tugas yang dimiliki oleh pengguna saat ini
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.date.asc()).all()
    return render_template('home.html', tasks=tasks)

@main.route("/register", methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User(username=form.username.data, email=form.email.data, password=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash('Your account has been created! You are now able to log in', 'success')
        return redirect(url_for('main.login'))
    return render_template('register.html', title='Register', form=form)

@main.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.home'))
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template('login.html', title='Login', form=form)

@main.route("/task/new", methods=['GET', 'POST'])
@login_required
def new_task():
    form = TaskForm()
    if form.validate_on_submit():
        # Menyimpan tugas baru ke dalam database
        task = Task(title=form.title.data, description=form.description.data, date=form.date.data, author=current_user)
        db.session.add(task)
        db.session.commit()
        flash('Your task has been created!', 'success')
        return redirect(url_for('main.home'))
    return render_template('create_task.html', title='New Task', form=form)

@main.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('main.home'))

@main.route("/reset_password", methods=['GET', 'POST'])
def reset_password():
    form = ResetPasswordForm()
    if form.validate_on_submit():
        # Implement password reset logic here
        flash('An email has been sent with instructions to reset your password.', 'info')
        return redirect(url_for('main.login'))
    return render_template('reset_password.html', title='Reset Password', form=form)

@main.route("/api/events", methods=['GET', 'POST'])
@login_required
def handle_events():
    if request.method == 'GET':
        # Mengambil semua tugas untuk pengguna saat ini
        tasks = Task.query.filter_by(user_id=current_user.id).all()
        return jsonify([task.to_dict() for task in tasks])
    elif request.method == 'POST':
        data = request.json
        # Mengambil dan menyimpan tugas baru dari data JSON
        task = Task(title=data['title'], date=data['start'], user_id=current_user.id)
        db.session.add(task)
        db.session.commit()
        return jsonify(task.to_dict()), 201

@main.route("/api/events/<int:event_id>", methods=['DELETE'])
@login_required
def delete_event(event_id):
    task = Task.query.get_or_404(event_id)
    # Memastikan bahwa hanya pengguna yang memiliki tugas yang bisa menghapusnya
    if task.author != current_user:
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(task)
    db.session.commit()
    return '', 204
