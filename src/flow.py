import random
from typing import List
random.seed(0)

class Observer:
    def on_notify(self, event_type, data):
        raise NotImplementedError

# Should I store their positions on screen?
class Shield:
    def __init__(self):
        self.hp = 1
    def __str__(self):
        return f"Shield(hp={self.hp})"
class Bomb:
    def __init__(self):
        self.pow = 1
    def __str__(self):
        return f"Bomb(pow={self.pow})"

class Player(Observer):
    '''These would probably be stored in the server, so I'm not saving the player choices here '''
    def __init__(self, name, table: 'Table'):
        self.table = table
        self.name = name
        self.hp = 0

        self.shields: List[Shield] = []
        self.bombs: List[Bomb] = []

    def on_notify(self, event_type, data):
        '''This is what the frontend would see'''
        print(f"{self.name} received notification: {event_type} with data: {data}")
        match event_type:
            case "rpsResult":
                print(f"{self.name} won the round!")
            case "build":
                type = data["type"]
            case "attack":
                type = data["type"]
                target = data["target"]
                print(f"{self.name} attacked {target.name} with {type}")
            case "upgrade":
                type = data["type"]
                target = data["target"]
                print(f"{self.name} upgraded their {target.name}")
            case _:
                print(f"Unknown event type: {event_type}")

    def handleInputRps(self):
        '''Just for submitting rps choices'''
        choice = input("r/p/s/q: ")
        assert choice in ['r', 'p', 's', 'q'], "Invalid choice"
        table.onPlayerInput(self, "rps", {
            "choice": choice
        })

    def handleInputTower(self):
        '''For choosing tower upgrades. Sends all the configs for their turn at once
        Assert it should always be in good format'''

        # tower incomplete, build auto
        if table.roundWinner.hp < 4:
            print("auto build")
            table.onPlayerInput(self, "tower", {
                "action": "build",
                "type": "tower"
            })
        # tower complete
        #control available options here

        if (len(table.roundWinner.bombs)==0 and len(table.roundWinner.shields)==0):
            #no bombs and no shields
            choice = input("build: ")
        elif (len(table.roundWinner.shields)>0 and len(table.roundWinner.bombs)==0):
            #no bombs AND yes shields, can't atack
            choice = input("build/upgrade: ")
        else:
            #bombs and shields, all
            choice = input("build/attack/upgrade: ")
        assert choice in ['b', 'a', 'u'], "Invalid choice"

        # format the data sent to server
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
                attackC = input("target tower/bomb:")
                i = int(input("target which bomb (index)):"))
            case "u":
                #can choose upgrade if u must have shields, but may or may not have bombs
                # input
                if (table.roundWinner == p1):
                    upgradeC = input("upgrade shield/bomb:")
                    i = int(input("target which one (index)):"))
            case 'q':
                exit()
            case _:
                print("Invalid choice:", choice)
                return

        table.onPlayerInput(self, "tower", {
            "action": choice,
            "type": None
        })


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
        '''Types:
        - rpsResult: {winner, loser}
        - build: type, player
        - attack: type, player, target
        - upgrade: type, player, target'''
        for player in self.players:
            print(f"sending to {player}:", event_type, data)
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
    
    def handleBuild(self, type:str):
        assert type in ["shield", "bomb", "tower"], "Invalid type"
        if (self.roundWinner == None or self.roundLoser == None):
            print("no winner")
            return
        if type == "shield":
            self.roundWinner.shields.append(Shield())
        elif type == "bomb":
            self.roundWinner.bombs.append(Bomb())
        elif type == "tower":
            assert self.roundWinner.hp < 4, "tower already complete"
            self.roundWinner.hp += 1

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

            if target.hp < 0:
                print(target.hp)
                print(target, "died!")

        elif type == "bomb":
            target.bombs.pop(targetIndex)
        attacker.bombs.pop(atkIndex)
    
    def handleUpgrade(self, type, index:int):
        assert type in ["shield", "bomb"], "Invalid type"
        
        if (self.roundWinner == None or self.roundLoser == None):
            print("no winner")
            return
        if type == "shield":
            assert index >=0 and index < len(self.roundWinner.shields), "Invalid index"
            self.roundWinner.shields[index].hp += 1
        elif type == "bomb":
            assert index >=0 and index < len(self.roundWinner.bombs), "Invalid index"
            self.roundWinner.bombs[index].bomb += 1
    
    def onPlayerInput(self, player: Player, type: str, data:dict):
        '''which player did what type of action:
        type: rps OR tower
        if type == rps:
            data = {choice: 'r'/'p'/'s'}
        if type == tower:
            data = {action: 'build'/'attack'/'upgrade', type: 'shield'/'bomb'/'tower'}
        '''
        if type == "rps":
            # get player input
            choice = data["choice"]
            if choice == 'q':
                exit()
            
            p1Rps = choice

            # When we have a server, this will be the other player, how to change this
            p2Rps = random.choice(['r', 'p', 's'])

            print("Results:",p1Rps,"vs", p2Rps)
            print("----")
            
            self.decideWinner(p1Rps, p2Rps)

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
    
    # winner actions
    
