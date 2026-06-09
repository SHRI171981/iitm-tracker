import sys
from app.database import SessionLocal # Adjust import path if your session maker is named differently
from app import models
from helpers.security import get_password_hash


def create_user(username: str, email: str, name: str, password: str, is_admin: bool = False):
    db = SessionLocal()
    try:
        # 1. Check for existing user to prevent duplicate constraint crashes
        existing_user = db.query(models.User).filter(models.User.username == username).first()
        if existing_user:
            print(f"User '{username}' already exists.")
            return

        # 2. Create the base User record
        hashed_password = get_password_hash(password)
        new_user = models.User(
            username=username,
            password_hash=hashed_password,
            is_admin=is_admin
        )
        
        # Add and flush to generate the UUID without fully committing yet
        db.add(new_user)
        db.flush() 

        # 3. Create the associated Student profile record
        new_profile = models.Student(
            name=name,
            email=email,
            user_id=new_user.id
        )
        db.add(new_profile)

        # 4. Commit the transaction
        db.commit()
        
        role = "ADMIN" if is_admin else "STUDENT"
        print(f"Successfully created {role}: {username}")

    except Exception as e:
        db.rollback()
        print(f"❌ Database error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    print("\n--- User Creation Utility ---")
    
    # Prompt the developer for inputs directly in the terminal
    u_name = input("Enter full name: ")
    u_email = input("Enter email address: ")
    u_username = input("Enter username: ")
    u_password = input("Enter password: ")
    
    admin_prompt = input("Make this user an ADMIN? (y/n): ").strip().lower()
    make_admin = admin_prompt == 'y'
    
    create_user(
        username=u_username, 
        email=u_email, 
        name=u_name, 
        password=u_password, 
        is_admin=make_admin
    )