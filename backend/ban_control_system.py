import tkinter as tk
from tkinter import ttk, messagebox
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, DECIMAL
from sqlalchemy.orm import sessionmaker, declarative_base

# Create database engine
engine = create_engine("sqlite:///users.db")
Base = declarative_base()
Session = sessionmaker(bind=engine)
session = Session()

# Define Users and BattleHistory tables
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    banned = Column(Boolean, default=False)

class BattleHistory(Base):
    __tablename__ = "battle_history"
    matchID = Column(Integer, primary_key=True, autoincrement=True)
    match_end_time = Column(DateTime, nullable=False)
    player1 = Column(String, nullable=False)
    player2 = Column(String, nullable=False)
    player1_rpsWinrate = Column(DECIMAL(5,2), nullable=False)
    player2_rpsWinrate = Column(DECIMAL(5,2), nullable=False)
    winner = Column(String)

Base.metadata.create_all(engine)

# GUI Application
class AdminPanel(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("User Management")
        self.geometry("550x600")

        # Search box
        tk.Label(self, text="Search Username:").pack(pady=5)
        self.search_entry = tk.Entry(self)
        self.search_entry.pack()
        self.search_entry.bind("<Return>", self.search_user)

        # See all banned users button
        ttk.Button(self, text="See All Banned Users", command=self.show_banned_users).pack(pady=5)
        self.banned_window = None  # Track banned users window

    def search_user(self, event):
        username = self.search_entry.get().strip()
        user = session.query(User).filter(User.username == username).first()

        if user:
            self.show_user_popup(user)
        else:
            messagebox.showerror("Not Found", f"No user found with username '{username}'.")

    def show_user_popup(self, user):
        popup = tk.Toplevel(self)
        popup.title(f"User: {user.username}")
        popup.geometry("400x400")

        tk.Button(popup, text="✖", command=popup.destroy).pack(anchor="ne", padx=5, pady=5)
        tk.Label(popup, text=f"Username: {user.username}", font=("Arial", 14)).pack(pady=5)

        ban_btn = ttk.Button(popup, text="Ban User", command=lambda: self.ban_user(user, popup))
        ban_btn.pack(pady=5)

        tk.Label(popup, text="Battle History:", font=("Arial", 12, "bold")).pack()
        self.display_battle_history(popup, user.username)

    def show_banned_users(self):
        if self.banned_window and self.banned_window.winfo_exists():
            self.banned_window.lift()  # Bring the window to front
            return

        self.banned_window = tk.Toplevel(self)
        self.banned_window.title("Banned Users")
        self.banned_window.geometry("400x500")

        tk.Button(self.banned_window, text="✖", command=self.banned_window.destroy).pack(anchor="ne", padx=5, pady=5)
        tk.Label(self.banned_window, text="List of Banned Users", font=("Arial", 12, "bold")).pack()

        self.refresh_banned_users(self.banned_window)

    def refresh_banned_users(self, banned_window):
        """ Refresh banned users list dynamically """
        for widget in banned_window.winfo_children():
            if isinstance(widget, tk.Frame):
                widget.destroy()

        banned_frame = tk.Frame(banned_window)
        banned_frame.pack(expand=True, fill=tk.BOTH)

        canvas = tk.Canvas(banned_frame)
        scrollbar = ttk.Scrollbar(banned_frame, orient="vertical", command=canvas.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        inner_frame = ttk.Frame(canvas)
        canvas.create_window((0, 0), window=inner_frame, anchor="nw")

        users = session.query(User).filter(User.banned == 1).all()
        for user in users:
            row = ttk.Frame(inner_frame)
            row.pack(fill=tk.X, padx=5, pady=2)
            tk.Label(row, text=user.username).pack(side=tk.LEFT)

            ttk.Button(row, text="Unban", command=lambda u=user: self.unban_user(u, banned_window)).pack(side=tk.LEFT, padx=5)
            ttk.Button(row, text="View History", command=lambda u=user: self.view_history(u.username)).pack(side=tk.LEFT, padx=5)

        inner_frame.update_idletasks()
        canvas.config(scrollregion=canvas.bbox("all"))

    def ban_user(self, user, popup):
        user.banned = 1
        session.commit()
        messagebox.showinfo("Success", f"{user.username} has been banned.")
        popup.destroy()
        if self.banned_window and self.banned_window.winfo_exists():
            self.refresh_banned_users(self.banned_window)

    def unban_user(self, user, banned_window):
        user.banned = 0
        session.commit()
        messagebox.showinfo("Success", f"{user.username} has been unbanned.")
        self.refresh_banned_users(banned_window)

    def view_history(self, username):
        history_window = tk.Toplevel(self)
        history_window.title(f"Battle History: {username}")

        history_window.geometry("1500x500")  
        history_window.minsize(1500, 500)  
        history_window.maxsize(1500, 500)  
        history_window.update_idletasks()  

        tk.Button(history_window, text="✖", command=history_window.destroy).pack(anchor="ne", padx=5, pady=5)
        self.display_battle_history(history_window, username)

    def display_battle_history(self, parent, username):
        history_frame = tk.Frame(parent)
        history_frame.pack(expand=True, fill=tk.BOTH)

        canvas = tk.Canvas(history_frame)
        scrollbar = ttk.Scrollbar(history_frame, orient="vertical", command=canvas.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        inner_history_frame = ttk.Frame(canvas)
        canvas.create_window((0, 0), window=inner_history_frame, anchor="center")  # Center-align table

        headers = ["Match ID", "End Time", "Player1", "Player2", "P1 Winrate", "P2 Winrate", "Winner"]
        for col, header in enumerate(headers):
            tk.Label(inner_history_frame, text=header, font=("Arial", 10, "bold")).grid(row=0, column=col, padx=10, sticky="nsew")

        records = session.query(BattleHistory).filter(
            (BattleHistory.player1 == username) | (BattleHistory.player2 == username)
        ).all()

        for row, record in enumerate(records, start=1):
            values = [record.matchID, record.match_end_time, record.player1, record.player2,
                      record.player1_rpsWinrate, record.player2_rpsWinrate, record.winner]

            for col, value in enumerate(values):
                tk.Label(inner_history_frame, text=str(value), anchor="center").grid(row=row, column=col, padx=10, sticky="nsew")

        inner_history_frame.update_idletasks()
        canvas.config(scrollregion=canvas.bbox("all"))

# Run the application
if __name__ == "__main__":
    app = AdminPanel()
    app.mainloop()