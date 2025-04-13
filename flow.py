import random
from abc import ABC, abstractmethod
from typing import List
random.seed(0)

DEBUG = True
def debug(*msg):
    global DEBUG
    if DEBUG:
        print(msg)

# Message object
class RpsResult:
    def __init__(self, winner:'Player', loser:'Player'):
        '''
        Useful for JWT reference, seen by the server and both players
        Valid actions:
        - r/p/s/q
        '''
        self.winner:Player = winner
        self.loser:Player = loser

    def __str__(self):
        return f"RpsResult({self.winner} wins, {self.loser} loses)"

# Message object
class RpsAction:
    def __init__(self, source:'Player', choice: str):
        '''
        Useful for JWT reference, seen by the server and both players
        Valid actions:
        - r/p/s/q
        '''
        assert choice in ['r', 'p', 's', 'q'], "Invalid choice"
        self.source:Player = source
        self.choice:str = choice

    def __str__(self):
        return f"RpsAction(choice={self.choice})"
    
# list of constants
class TowerActionTypes:
    BUILD_TOWER = 'bt'
    BUILD_SHIELD = 'bs'
    BUILD_BOMB = 'bb'
    ATTACK_TOWER = 'at'
    ATTACK_BOMB = 'ab'
    UPGRADE_SHIELD = 'us'
    UPGRADE_BOMB = 'ub'
    QUIT = 'q'

# Message object
class TowerAction:
    def __init__(self, source:'Player', action: TowerActionTypes, target:list[int] = None):
        '''
        Useful for JWT reference, seen by the server and both players
        Valid actions:
        action: see TowerActionTypes
        target:
            - build (b): None
            - attack tower (at): (index_of_atker's_bomb)
            - attack bomb (ab): (index_of_atker's_bomb, index_of_target's_bomb)
            - upgrade shield (us): (index_of_shield)
            - upgrade bomb (ub): (index_of_bomb)
        '''
        assert action in vars(TowerActionTypes).values(), "Invalid action"
        self.source: Player = source #who sent this msg
        self.action:str = action
        self.target:list[int] = target

    def __str__(self):
        return f"TowerAction(emitter={self.source} action={self.action} target={self.target})"

class Observer(ABC):
    @abstractmethod
    def on_notify(self, event_type, data):
        raise NotImplementedError

# Should I store their positions on screen?
class Shield:
    def __init__(self):
        self.hp = 1
    def __repr__(self):
        return f"Shield(hp={self.hp})"
class Bomb:
    def __init__(self):
        self.pow = 1
    def __repr__(self):
        return f"Bomb(pow={self.pow})"

class Player(Observer):
    '''These would probably be stored in the server, so I'm not saving the player choices here '''
    def __init__(self, name):
        self.name = name
        self.hp = 0

        self.shields: List[Shield] = []
        self.bombs: List[Bomb] = []

    def __str__(self):
        return f"Player(name={self.name}, hp={self.hp}, shields={self.shields}, bombs={self.bombs})"
    def on_notify(self, move: TowerAction):
        '''This is what the frontend would see'''
        debug(f"{self.name} received notification: {move}")
        
    def handleInputRps(self)->RpsAction:
        '''Just for submitting rps choices'''
        print(f"{self.name} ",end='')
        choice = input("r/p/s/q: ")
        assert choice in ['r', 'p', 's', 'q'], "Invalid choice"
        
        return RpsAction(self, choice)

    def handleInputTower(self)->TowerAction:
        '''For choosing actions. Sends all the configs for their turn at once
        Assert it should always be in good format'''

        # tower incomplete, build auto
        if table.roundWinner.hp < 4:
            print("auto build")
            return TowerAction(self, TowerActionTypes.BUILD_TOWER, None)
            
        # tower complete
        #control available options here
        if (len(table.roundWinner.bombs)==0 and len(table.roundWinner.shields)==0):
            #no bombs and no shields
            action = input("build: ")
        elif (len(table.roundWinner.shields)>0 and len(table.roundWinner.bombs)==0):
            #no bombs AND yes shields, can't atack
            action = input("build/upgrade: ")
        else:
            #bombs and shields, all
            action = input("build/attack/upgrade: ")
        assert action in ['b', 'a', 'u'], "Invalid choice"

        match action:
            case "b":
                target = input("add a shield/bomb: ")
                return TowerAction(self, TowerActionTypes.BUILD_SHIELD if target == "s" else TowerActionTypes.BUILD_BOMB, None)
            case "a":
                target = input("target tower/bomb:")
                i_atk = int(input("index of your bomb (index):"))
                assert i_atk >= 0 and i_atk < len(self.bombs), "Invalid self bomb index"

                if target == "t":
                    #attack tower
                    return TowerAction(self, TowerActionTypes.ATTACK_TOWER, [i_atk])
                elif target == "b":
                    i_tgt = int(input("target which opponent bomb (index)):"))
                    assert i_tgt >= 0 and i_tgt < len(self.bombs), "Invalid opp bomb index"

                    return TowerAction(self, TowerActionTypes.ATTACK_BOMB, [i_atk, i_tgt])
            case "u":
                #can choose upgrade if u have shields, but may or may not have bombs
                target = input("upgrade shield/bomb:")
                if target == "s":
                    i = int(input("target which one of your shields(index):"))
                    assert i >= 0 and i < len(self.shields), "Invalid own shield index"

                    return TowerAction(self, TowerActionTypes.UPGRADE_SHIELD, [i])
                elif target == "b":
                    i = int(input("target which one of your bombs(index):"))
                    assert i >= 0 and i < len(self.bombs), "Invalid own bomb index"

                    return TowerAction(self, TowerActionTypes.UPGRADE_BOMB, [i])
            case 'q':
                print("Note the actual game doesnt have this")
                raise Exception("Quit")
            case _:
                raise Exception("Invalid choice: "+action)
        
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
        self.roundWinner:Player = None
        self.roundLoser:Player = None
        self.finalWinner:Player = None
        self.rounds = 0
        self.gameOver = False
    
    def addPlayer(self, player: Player):
        self.players.append(player)

    def removePlayer(self, player: Player):
        self.players.remove(player)

    def notify(self, msg):
        #wip
        for player in self.players:
            player.on_notify(msg)

    def decideWinner(self, p1RpsAction: RpsAction, p2RpsAction: RpsAction):
        '''Whose turn is it?'''
        p1Rps = p1RpsAction.choice
        p2Rps = p2RpsAction.choice
        if (p1Rps == p2Rps):
            print("draw")
            self.roundWinner = self.roundLoser = None
        elif (p1Rps == 'r' and p2Rps == 's' or p1Rps == 's' and p2Rps == 'p' or p1Rps == 'p' and p2Rps == 'r'):
            print("p1 win")
            self.roundWinner = self.players[0]
            self.roundLoser = self.players[1]
        else:
            print("p2 win")
            self.roundWinner = self.players[1]
            self.roundLoser = self.players[0]
        self.notify(RpsResult(self.roundWinner, self.roundLoser))
        
    def showPlayers(self):
        print("-------type initials only-----------")
        print("p1:", table.players[0].hp, "vs", table.players[1].hp, ":p2")
        print("p1 shields: ", table.players[0].shields, "p2 shields: ", table.players[1].shields)
        print("p1 bombs: ", table.players[0].bombs, "p2 bombs: ", table.players[1].bombs)
        print("----------------------")
    
    def handleBuild(self, bldAction: TowerAction):
        action: str = bldAction.action
        assert action in [TowerActionTypes.BUILD_BOMB, TowerActionTypes.BUILD_SHIELD, TowerActionTypes.BUILD_TOWER], "Invalid type"

        if (self.roundWinner == None or self.roundLoser == None):
            print("no winner")
            return
        
        if action == TowerActionTypes.BUILD_SHIELD:
            self.roundWinner.shields.append(Shield())
        elif action == TowerActionTypes.BUILD_BOMB:
            self.roundWinner.bombs.append(Bomb())
        elif action == TowerActionTypes.BUILD_TOWER:
            assert self.roundWinner.hp < 4, "tower already complete"
            self.roundWinner.hp += 1
    
    def handleAttack(self, atkAction: TowerAction):
        action: str = atkAction.action
        atkIndex: int = atkAction.target[0]
        targetIndex: int = atkAction.target[1] if action == TowerActionTypes.ATTACK_BOMB else None
        assert action in [TowerActionTypes.ATTACK_BOMB, TowerActionTypes.ATTACK_TOWER], "Invalid type"

        if (self.roundWinner == None or self.roundLoser == None):
            print("no winner")
            return
        
        attacker = self.roundWinner
        target = self.roundLoser
        
        assert len(attacker.bombs) > 0, "no bombs"
        if action == TowerActionTypes.ATTACK_TOWER:
            if (len(target.shields) > 0):
                # attack the frontmost shield, then tower
                if target.shields[-1].hp > 0:
                    target.shields[-1].hp -= 1
                else:
                    target.shields.pop()
            else:
                target.hp -= 1

            if target.hp < 0:
                debug(target.hp)
                print(target, "died!")
                self.gameOver = True
                return

        elif action == TowerActionTypes.ATTACK_BOMB:
            target.bombs.pop(targetIndex)

        attacker.bombs.pop(atkIndex)
        
    def handleUpgrade(self, upgAction: TowerAction):
        action: str = upgAction.action
        index: int = upgAction.target[0]
        assert action in [TowerActionTypes.UPGRADE_BOMB, TowerActionTypes.UPGRADE_SHIELD], "Invalid type"
        
        if (self.roundWinner == None or self.roundLoser == None):
            print("no winner")
            return
        
        if action == TowerActionTypes.UPGRADE_SHIELD:
            assert index >=0 and index < len(self.roundWinner.shields), "Invalid index"
            self.roundWinner.shields[index].hp += 1
        elif action == TowerActionTypes.UPGRADE_BOMB:
            assert index >=0 and index < len(self.roundWinner.bombs), "Invalid index"
            self.roundWinner.bombs[index].pow += 1

    def startGame(self, player1: Player, player2: Player):
        # call when everything is initialized
        # notify players every step
        while not self.gameOver:
            self.showPlayers()
            self.roundWinner = None
            self.roundLoser = None
            self.rounds += 1

            # get player inputs
            p1RpsAction:RpsAction = player1.handleInputRps()
            p2RpsAction:RpsAction = player2.handleInputRps()

            print("Results:",p1RpsAction,"vs", p2RpsAction)
            print("----")

            # determine winner, sets roundWinner and roundLoser
            # ask for input at winner
            # notify both
            self.decideWinner(p1RpsAction, p2RpsAction)
            if self.roundWinner == None:
                continue
            elif self.roundWinner == player1:
                towerAction: TowerAction = player1.handleInputTower()

            elif self.roundWinner == player2:
                towerAction: TowerAction = player2.handleInputTower()
            else:
                raise Exception("hey your not sposed to see this eror")
            
            print("tower action:", towerAction)
            
            match towerAction.action:
                case TowerActionTypes.BUILD_TOWER | TowerActionTypes.BUILD_SHIELD | TowerActionTypes.BUILD_BOMB:
                    self.handleBuild(towerAction)
                case TowerActionTypes.ATTACK_TOWER | TowerActionTypes.ATTACK_BOMB:
                    self.handleAttack(towerAction)
                case TowerActionTypes.UPGRADE_SHIELD | TowerActionTypes.UPGRADE_BOMB:
                    self.handleUpgrade(towerAction)
                case TowerActionTypes.QUIT:
                    print("quit")
                    raise Exception("Quit")
                case _:
                    raise Exception("Invalid action")
            
p1 = Player("discovry")
p2 = Player("noogai67")

table = Table()
table.addPlayer(p1)
table.addPlayer(p2)
    
table.startGame(p1, p2)

print(
f'''
gg, {table.roundWinner.name} wins the game!
total number of rounds: {table.rounds}

    ''')