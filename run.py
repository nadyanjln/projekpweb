from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Buat user pertama jika belum ada
        if not User.query.filter_by(email='admin@example.com').first():
            user = User(username='admin', email='admin@example.com', password=generate_password_hash('password'))
            db.session.add(user)
            db.session.commit()
    app.run(debug=True)