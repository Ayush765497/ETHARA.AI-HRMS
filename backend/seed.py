from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.employee import Employee, Department
from app.models.leave import LeaveType
from app.models.announcement import Announcement
from app.models.course import Course


def seed_db():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("✅ Database tables created.")

        # Admin user
        if not User.query.filter_by(email='admin@xceltech.com').first():
            admin = User(email='admin@xceltech.com', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.flush()
            print("✅ Admin user created: admin@xceltech.com / admin123")
        else:
            print("ℹ️  Admin user already exists.")

        # Departments
        dept_names = ['Engineering', 'Design & Marketing',
                      'Human Resources', 'Finance', 'Operations']
        depts = {}
        for name in dept_names:
            dept = Department.query.filter_by(name=name).first()
            if not dept:
                dept = Department(name=name)
                db.session.add(dept)
                db.session.flush()
            depts[name] = dept
        print(f"✅ Departments ready.")

        # Sample Employees
        sample_employees = [
            ('John', 'Doe', 'john.doe@xceltech.com', 'UI/UX Designer',
             'Design & Marketing', 'Full time', 150000),
            ('Jane', 'Smith', 'jane.smith@xceltech.com',
             'Backend Developer', 'Engineering', 'Full time', 200000),
            ('Alice', 'Johnson', 'alice.j@xceltech.com',
             'HR Manager', 'Human Resources', 'Full time', 180000),
            ('Barry', 'Jonah', 'barry.j@xceltech.com',
             'Frontend Developer', 'Engineering', 'Full time', 160000),
            ('Tiwa', 'Cole', 'tiwa.c@xceltech.com',
             'Financial Analyst', 'Finance', 'Full time', 175000),
        ]
        for first, last, email, title, dept_name, category, salary in sample_employees:
            if not Employee.query.filter_by(email=email).first():
                emp = Employee(
                    first_name=first, last_name=last, email=email,
                    job_title=title, department_id=depts[dept_name].id,
                    job_category=category, salary=salary, city='Lagos',
                    phone_number='080' +
                    str(abs(hash(email)) % 100000000).zfill(8)
                )
                db.session.add(emp)
                db.session.flush()
                # create employee user record too
                if not User.query.filter_by(email=email).first():
                    u = User(email=email, role='employee', employee_id=emp.id)
                    u.set_password('password123')
                    db.session.add(u)
                    emp.user_id = u.id
        print("✅ Sample employees ready.")

        # Leave types
        leave_types = [
            ('Annual Leave', 60), ('Sick Leave', 20), ('Maternity Leave', 120),
            ('Casual Leave', 30), ('Exam Leave', 14), ('Compassionate Leave', 15)
        ]
        for name, days in leave_types:
            if not LeaveType.query.filter_by(name=name).first():
                db.session.add(LeaveType(name=name, total_days=days))
        print("✅ Leave types ready.")

        # Announcements
        if not Announcement.query.first():
            db.session.add(Announcement(
                title='Welcome to XCELTECH HRMS!',
                content='Your HR system is live. Manage employees, leaves, payroll and more from one place.',
                created_by=1, is_pinned=True
            ))
            db.session.add(Announcement(
                title='Staff Meeting — All Teams',
                content='Monthly all-hands meeting scheduled for this Friday at 10:00 AM.',
                created_by=1
            ))
        print("✅ Announcements ready.")

        # Courses
        if not Course.query.first():
            courses = [
                Course(title='Advanced Microsoft Excel', description='Master data analysis with Excel',
                       category='Technology', duration_hours=24, instructor='John Smith'),
                Course(title='Leadership & Management', description='Effective leadership strategies',
                       category='Management', duration_hours=16, instructor='Dr. Ada Okafor'),
                Course(title='Communication Skills', description='Professional workplace communication',
                       category='Soft Skills', duration_hours=8, instructor='Mary Johnson'),
            ]
            for c in courses:
                db.session.add(c)
        print("✅ Courses ready.")

        db.session.commit()
        print("\n" + "=" * 50)
        print("  🚀 Next AI HRMS ready!")
        print("  Admin: admin@xceltech.com / admin123")
        print("=" * 50)


if __name__ == '__main__':
    seed_db()
