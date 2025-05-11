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
                WebDriverWait(self.driver, 5).until(
                    EC.url_to_be(self.base_url)
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

if __name__ == "__main__":
    client = Mock_Browser_Client("http://127.0.0.1:5000")
    try:
        browser = client.create_browser()
        # Test signup
        #success, message = client.signup("testuser", "test@example.com", "testpassword", "XXXX-XXXX-XXXX-XXXX")
        #print(f"Signup {'successful' if success else 'failed'}: {message}")
        # Test login
        success, message = client.login("testuser", "testpassword")
        print(f"Login {'successful' if success else 'failed'}: {message}")
        input("Press Enter to close browser...")
    finally:
        client.close_browser()