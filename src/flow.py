import random
random.seed(0)

class Player:
    '''These would probably be stored in the server, so I'm not saving the player choices here '''
    def __init__(self, name):
        self.name = name
        self.hp = 0

        self.shields = []
        self.bombs = []

    def build(self, type):
        assert type in ["shield", "bomb", "tower"], "Invalid type"
        if type == "shield":
            self.shields.append(1)
        elif type == "bomb":
            self.bombs.append(1)
        elif type == "tower":
            self.hp += 1

    def attack(self, target: 'Player', type, index: int = None):
        assert type in ["shield", "bomb", "tower"], "Invalid type"
        if (len(self.bombs) <= 0):
            print("no bombs")
            return
        if type == "tower":
            if (len(target.shields) > 0):
                target.shields.pop()
            else:
                target.hp -= 1
        elif type == "bomb":
            target.bombs.pop(index)
        self.bombs.pop()

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

p1 = Player("p1")
p2 = Player("p2")
roundWinner: Player = None
roundLoser: Player = None
finalWinner: Player = None

rps = ['r', 'p', 's']
improve = ['build', 'attack', 'upgrade']
bld = ["shield", "bomb"]

while True:
    print("-------type initials only-----------")
    print("p1:", p1.hp, "vs", p2.hp, ":p2")
    print("p1 shields: ", p1.shields, "p2 shields: ", p2.shields)
    print("p1 bombs: ", p1.bombs, "p2 bombs: ", p2.bombs)
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
    if (p1Rps == p2Rps):
        print("draw")
        continue
    elif (p1Rps == 'r' and p2Rps == 's' or p1Rps == 's' and p2Rps == 'p' or p1Rps == 'p' and p2Rps == 'r'):
        print("win")
        roundWinner = p1
        roundLoser = p2
    else:
        print("lose")
        roundWinner = p2
        roundLoser = p1
    
    # tower incomplete, build auto
    if roundWinner.hp < 4:
        print("auto build")
        roundWinner.build("tower")
        continue

    # tower complete
    #control available options here
    if (len(roundWinner.bombs)==0 and len(roundWinner.shields)==0):
        #no bombs and no shields
        choice = "b"
    elif (len(roundWinner.shields)>0 and len(roundWinner.bombs)==0):
        #no bombs AND yes shields, can't atack
        if (roundWinner == p1):
            choice = input("build/upgrade: ")
        else:
            choice = random.choice(["b", "u"])
    else:
        #bombs and shields, all
        if (roundWinner == p1):
            choice = input("build/attack/upgrade: ")
        else:
            choice = random.choice(["b", "a", "u"])

    # winner actions
    match choice:
        case "b":
            # input
            if (roundWinner == p1):
                buildC = input("add a shield/bomb: ")
            else:
                buildC = random.choice(['s', 'b'])

            print("building", buildC)
            
            if buildC == "s":
                roundWinner.build("shield")
            else:
                roundWinner.build("bomb")
        case "a":
            # input
            if (roundWinner == p1):
                attackC = input("target tower/bomb:")
            else:
                attackC = random.choice(['t', 'b'])

            print("attacking", attackC)
            
            if attackC == "t":
                roundWinner.attack(roundLoser, "tower")

                if roundLoser.hp < 0:
                    print(roundLoser.hp)
                    print("gg")
                    break
            else:
                i = int(input("target which bomb (index)):"))
                roundWinner.attack(roundLoser,"bomb", i)
        case "u":
            #can choose upgrade if u must have shields, but may or may not have bombs
            # input
            if (roundWinner == p1):
                upgradeC = input("upgrade shield/bomb:")
                i = int(input("target which one (index)):"))
            else:
                upgradeC = "s" if (len(roundWinner.bombs) == 0) else random.choice(['s', 'b'])

                if upgradeC == "s":
                    i = random.randint(0, len(roundWinner.shields)-1)
                else:
                    #why is it  here
                    i = random.randint(0, len(roundWinner.bombs)-1)

            print("upgrading", upgradeC, i)

            if upgradeC == "s":
                roundWinner.upgrade("shield", i)
            else:
                roundWinner.upgrade("bomb", i)
        case 'q':
            break
        case _:
            print("Invalid choice:", choice)
            continue

