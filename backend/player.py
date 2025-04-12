class Player:
    def __init__(self):
        self.stack = [5]  # Initial shield with health 5

    def build_shield(self):
        """Add a new shield with health 3 to the stack"""
        self.stack.append(3)

    def build_cannon(self):
        """Add a cannon to the stack"""
        self.stack.append('C')

    def take_damage(self, damage):
        """
        Process incoming damage to the stack
        Returns remaining damage after processing
        """
        while damage > 0 and self.stack:
            top = self.stack[-1]
            
            if isinstance(top, int):  # Shield
                absorbed = min(damage, top)
                remaining = top - absorbed
                damage -= absorbed
                
                if remaining > 0:
                    self.stack[-1] = remaining
                else:
                    self.stack.pop()
            
            elif top == 'C':  # Cannon
                damage -= 1
                self.stack.pop()
        
        return damage

    def is_defeated(self):
        """Check if player has no more defenses"""
        return len(self.stack) == 0

    def get_stack(self):
        """Return current stack state"""
        return self.stack.copy()