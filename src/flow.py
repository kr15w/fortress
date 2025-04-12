import random
from abc import ABC, abstractmethod
from typing import List
random.seed(0)

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
        return f"RpsResult(choice={self.choice})"
    
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
    
class TowerActionTypes:
    BUILD_TOWER = 'bt'
    BUILD_SHIELD = 'bs'
    BUILD_BOMB = 'bb'
    ATTACK_TOWER = 'at'
    ATTACK_BOMB = 'ab'
    UPGRADE_SHIELD = 'us'
    UPGRADE_BOMB = 'ub'
    QUIT = 'q'
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
        assert action in TowerActionTypes, "Invalid action"
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

    def on_notify(self, move: TowerAction):
        '''This is what the frontend would see'''
        print(f"{self.name} received notification: {move}")
        '''
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
                print(f"Unknown event type: {event_type}")'''
        
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
            return TowerAction(self, "b", None)
            
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
                    return TowerAction(self, TowerActionTypes.ATTACK_TOWER, None)
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
    
    def addPlayer(self, player: Player):
        self.players.append(player)

    def removePlayer(self, player: Player):
        self.players.remove(player)

    def notify(self, towerAction: TowerAction):
        #wip
        '''Types:
        - rpsResult: {winner, loser}
        - build: type, player
        - attack: type, player, target
        - upgrade: type, player, target'''
        for player in self.players:
            print(f"sending to {player}:", event_type, data)
            player.on_notify(event_type, data)

    def decideWinner(self, p1Rps: str, p2Rps: str) -> Player:
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
        
    def showPlayers(self):
        print("-------type initials only-----------")
        print("p1:", table.players[0].hp, "vs", table.players[1].hp, ":p2")
        print("p1 shields: ", table.players[0].shields, "p2 shields: ", table.players[1].shields)
        print("p1 bombs: ", table.players[0].bombs, "p2 bombs: ", table.players[1].bombs)
        print("----------------------")
    
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
    
    def __use_return_instead___onPlayerInput(self, player: Player, type: str, data:dict):
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

    def startGame(self, player1: Player, player2: Player):
        # call when everything is initialized
        # notify players every step
        while self.finalWinner != None:
            self.showPlayers()
            # get player inputs
            p1Rps:str = player1.handleInputRps()
            p2Rps:str = player2.handleInputRps()
            if p1Rps == 'q' or p2Rps == 'q':
                break

            print("Results:",p1Rps,"vs", p2Rps)
            print("----")
            # determine winner, sets roundWinner and roundLoser
            self.decideWinner(player1, player2)

            if self.roundWinner == None:
                print("draw")
                continue
            elif self.roundWinner == player1:
                print("p1 wins")
                player1.handleInputTower()
            elif self.roundWinner == player2:
                print("p2 wins")
                player2.handleInputTower()
            else:
                raise Exception("hey your not sposed to see this eror")
            
p1 = Player("discovry")
p2 = Player("noogai67")

table = Table()
table.addPlayer(p1)
table.addPlayer(p2)
    
