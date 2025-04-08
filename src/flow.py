import random
from typing import List
random.seed(0)

class Observer:
    def on_notify(self, event_type, data):
        raise NotImplementedError

class Player(Observer):
    '''These would probably be stored in the server, so I'm not saving the player choices here '''
    def __init__(self, name):
        self.name = name
        self.hp = 0

        self.shields = []
        self.bombs = []

    def on_notify(self, event_type, data):
        print(f"{self.name} received notification: {event_type} with data: {data}")
    
    def build(self, type):
        assert type in ["shield", "bomb", "tower"], "Invalid type"
        if type == "shield":
            self.shields.append(1)
        elif type == "bomb":
            self.bombs.append(1)
        elif type == "tower":
            self.hp += 1

    def upgrade(self, type: str, index: int):
        if type == "shield":
            self.shields[index] += 1
        elif type == "bomb":
            self.bombs[index] += 1

    def display(self):
        print(self.name+": ")
        print("HP:", self.hp)
        print("Shields:", self.shields)
        print("bombs:", self.bombs, "\n")

class Table:
    '''
    Trying to impl the observer pattern. Instead of p1.attack(p2), Table would call p2.attacked(by p1).
    Probably useful as ref for server.
    '''
    def __init__(self):
        '''What other observers do we need?'''
        self.players: List[Player] = []
        self.roundWinner = None
        self.roundLoser = None
        self.finalWinner = None
        self.rounds = 0
    
    def addPlayer(self, player: Player):
        self.players.append(player)

    def removePlayer(self, player: Player):
        self.players.remove(player)

    def notify(self, event_type, data):
        for player in self.players:
            player.on_notify(event_type, data)

    def decideWinner(self, p1Rps, p2Rps):
        '''Whose turn is it?'''
        self.rounds += 1
        if (p1Rps == p2Rps):
            print("draw")
            return None
        elif (p1Rps == 'r' and p2Rps == 's' or p1Rps == 's' and p2Rps == 'p' or p1Rps == 'p' and p2Rps == 'r'):
            self.roundWinner = self.players[0]
            self.roundLoser = self.players[1]
            
        else:
            print("lose")
            self.roundWinner = self.players[1]
            self.roundLoser = self.players[0]
        self.notify("rpsResult", {
                "winner": self.roundWinner,
                "loser": self.roundLoser,
            })
    def handleAttack(self, type, atkIndex: int, targetIndex: int = None):
        # index is only for bombs
        assert type in ["bomb", "tower"], "Invalid type"
        if (self.roundWinner == None or self.roundLoser == None):
            print("no winner")
            return
        
        attacker = self.roundWinner
        target = self.roundLoser
        
        assert len(attacker.bombs) > 0, "no bombs"
        if type == "tower":
            if (len(target.shields) > 0):
                target.shields.pop()
            else:
                target.hp -= 1
        elif type == "bomb":
            target.bombs.pop(targetIndex)
        attacker.bombs.pop(atkIndex)

p1 = Player("discovry")
p2 = Player("noogai67")

table = Table()
table.addPlayer(p1)
table.addPlayer(p2)

rps = ['r', 'p', 's']
improve = ['build', 'attack', 'upgrade']
bld = ["shield", "bomb"]

while True:
    print("-------type initials only-----------")
    print("p1:", table.players[0].hp, "vs", table.players[1].hp, ":p2")
    print("p1 shields: ", table.players[0].shields, "p2 shields: ", table.players[1].shields)
    print("p1 bombs: ", table.players[0].bombs, "p2 bombs: ", table.players[1].bombs)
    print("----------------------")

    # get players inputs
    choice = input("r/p/s/q: ")
    if choice == 'q':
        break
    p1Rps = choice
    p2Rps = random.choice(rps)

    print("Results:",p1Rps,"vs", p2Rps)
    print("----")
    
    # determine winner
    if table.decideWinner(p1Rps, p2Rps) == None:
        print("draw")
        continue
    
    # tower incomplete, build auto
    if table.roundWinner.hp < 4:
        print("auto build")
        table.roundWinner.build("tower")
        continue

    # tower complete
    #control available options here
    if (len(table.roundWinner.bombs)==0 and len(table.roundWinner.shields)==0):
        #no bombs and no shields
        choice = "b"
    elif (len(table.roundWinner.shields)>0 and len(table.roundWinner.bombs)==0):
        #no bombs AND yes shields, can't atack
        if (table.roundWinner == p1):
            choice = input("build/upgrade: ")
        else:
            choice = random.choice(["b", "u"])
    else:
        #bombs and shields, all
        if (table.roundWinner == p1):
            choice = input("build/attack/upgrade: ")
        else:
            choice = random.choice(["b", "a", "u"])

    # winner actions
    match choice:
        case "b":
            # input
            if (table.roundWinner == p1):
                buildC = input("add a shield/bomb: ")
            else:
                buildC = random.choice(['s', 'b'])

            print("building", buildC)
            
            if buildC == "s":
                table.roundWinner.build("shield")
            else:
                table.roundWinner.build("bomb")
        case "a":
            # input
            if (table.roundWinner == p1):
                attackC = input("target tower/bomb:")
            else:
                attackC = random.choice(['t', 'b'])

            print("attacking", attackC)
            
            if attackC == "t":
                table.roundWinner.attack(roundLoser, "tower")

                if roundLoser.hp < 0:
                    print(roundLoser.hp)
                    print("gg")
                    break
            else:
                i = int(input("target which bomb (index)):"))
                table.roundWinner.attack(roundLoser,"bomb", i)
        case "u":
            #can choose upgrade if u must have shields, but may or may not have bombs
            # input
            if (table.roundWinner == p1):
                upgradeC = input("upgrade shield/bomb:")
                i = int(input("target which one (index)):"))
            else:
                upgradeC = "s" if (len(table.roundWinner.bombs) == 0) else random.choice(['s', 'b'])

                if upgradeC == "s":
                    i = random.randint(0, len(table.roundWinner.shields)-1)
                else:
                    #why is it  here
                    i = random.randint(0, len(table.roundWinner.bombs)-1)

            print("upgrading", upgradeC, i)

            if upgradeC == "s":
                table.roundWinner.upgrade("shield", i)
            else:
                table.roundWinner.upgrade("bomb", i)
        case 'q':
            break
        case _:
            print("Invalid choice:", choice)
            continue

