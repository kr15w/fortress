from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

class Mock_Browser_Client:
    def __init__(self, base_url):
        self.driver = None
        self.base_url = base_url

    def create_browser(self):
        options = Options()
        service = Service()
        self.driver = webdriver.Firefox(service=service, options=options)
        return self.driver

    def close_browser(self):
        if self.driver:
            self.driver.quit()

    def signup(self, username, email, password, license_key):
        try:
            # Navigate to signup page
            self.driver.get(self.base_url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.LINK_TEXT, "Create an Account"))
            ).click()
            
            # Wait for form and fill fields
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            self.driver.find_element(By.ID, "username").send_keys(username)
            self.driver.find_element(By.ID, "email").send_keys(email)
            self.driver.find_element(By.ID, "password").send_keys(password)
            self.driver.find_element(By.ID, "passwordConfirm").send_keys(password)
            self.driver.find_element(By.ID, "licenseKey").send_keys(license_key)
            
            # Submit form
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            
            # Check for successful redirect (5 second timeout)
            try:
                # First verify we're not still on signup page
                WebDriverWait(self.driver, 5).until_not(
                    EC.url_contains("/signup")
                )
                # Then verify we're on base URL
                WebDriverWait(self.driver, 5).until(
                    EC.url_contains(self.base_url)
                )
                return True, "Signup successful"
            except TimeoutException:
                # Check for error message
                page_source = self.driver.page_source
                if "Invalid or already used license key" in page_source:
                    return False, "Invalid or already used license key"
                elif "Email already registered" in page_source:
                    return False, "Email already registered"
                elif "Username already taken" in page_source:
                    return False, "Username already taken"
                else:
                    return False, "Unknown error occurred during signup"
                    
        except TimeoutException as e:
            return False, f"Timeout waiting for element: {str(e)}"
        except Exception as e:
            return False, f"Error during signup: {str(e)}"

    def login(self, username, password):
        try:
            # Navigate to login page
            self.driver.get(self.base_url)
            
            # Wait for form and fill fields
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            self.driver.find_element(By.ID, "username").send_keys(username)
            self.driver.find_element(By.ID, "password").send_keys(password)
            
            # Submit form
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            
            # Check for successful redirect to /menu
            try:
                WebDriverWait(self.driver, 5).until(
                    EC.url_contains("/menu")
                )
                return True, "Login successful"
            except TimeoutException:
                # Check for error message
                page_source = self.driver.page_source
                if "Login failed. Please check your credentials." in page_source:
                    return False, "Login failed. Please check your credentials."
                else:
                    return False, "Unknown error occurred during login"
                    
        except TimeoutException as e:
            return False, f"Timeout waiting for element: {str(e)}"
        except Exception as e:
            return False, f"Error during login: {str(e)}"

    def go_to_match_demo(self):
        try:
            self.driver.get(f"{self.base_url}/api/match_demo")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "gameState"))
            )
            return True
        except Exception:
            return False

    def get_game_state(self):
        try:
            element = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "gameState"))
            )
            
            return element.get_attribute("value")
        except Exception as e:
            print(f"Error getting game state: {str(e)}")
            return "{}"  # Return empty JSON object on error

    def press_button(self, button_name):
        try:
            self.driver.find_element(By.ID, button_name).click()
            return True
        except Exception:
            return False
    def set_text_field(self, field_name, content):
        try:
            field = self.driver.find_element(By.ID, field_name)
            field.clear()
            field.send_keys(content)
            return True
        except Exception:
            return False

    def get_room_id(self):
        try:
            return self.driver.find_element(By.ID, "roomId").get_attribute("value")
        except Exception:
            return ""



if __name__ == "__main__":
    # Create first client for testuser_3 (room creator)
    client1 = Mock_Browser_Client("http://127.0.0.1:5000")
    client2 = Mock_Browser_Client("http://127.0.0.1:5000")
    
    try:
        # Setup both browsers
        browser1 = client1.create_browser()
        browser2 = client2.create_browser()
        
        # Login testuser_3 and create room
        success1, message1 = client1.login("testuser_3", "testpassword")
        print(f"testuser_3 login {'successful' if success1 else 'failed'}: {message1}")
        
        if success1:
            if client1.go_to_match_demo():
                print("testuser_3 navigated to match demo page")
                if client1.press_button("joinRoomButton"):
                    room_id = client1.get_room_id()
                    print(f"Room created with ID: {room_id}")
                    
                    # Now login testuser_5 and join same room
                    success2, message2 = client2.login("testuser_5", "testpassword")
                    print(f"\ntestuser_5 login {'successful' if success2 else 'failed'}: {message2}")
                    
                    if success2:
                        if client2.go_to_match_demo():
                            print("testuser_5 navigated to match demo page")
                            if client2.set_text_field("roomId", room_id):
                                print(f"testuser_5 set room ID to {room_id}")
                                if client2.press_button("joinRoomButton"):
                                    print("testuser_5 joined room successfully")
                                    print(client2.get_game_state())
                                else:
                                    print("testuser_5 failed to click join button")
                            else:
                                print("testuser_5 failed to set room ID")
                        else:
                            print("testuser_5 failed to navigate to match demo")
                else:
                    print("testuser_3 failed to create room")
            else:
                print("testuser_3 failed to navigate to match demo")
        
        input("\nPress Enter to close browsers...")
    finally:
        client1.close_browser()
        client2.close_browser()