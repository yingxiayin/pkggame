import random
import numpy as np

import matplotlib.pyplot as plt

GOAL = 10000
RANK = 10000


def cal_e(play_time):
    if play_time in range(0, 5):
        return 1
    elif play_time in range(5, 10):
        return 0.96
    elif play_time in range(10, 15):
        return 0.90
    else:
        return 0.82


class Card(object):

    def __init__(self, power, e):
        self.power = power
        self.e = e


class CardGroup(object):

    def __init__(self, t, B, U, rank, time):
        self.card1 = Card((RANK - rank[0]), cal_e(time[0]))
        self.card2 = Card((RANK - rank[1]), cal_e(time[1]))
        self.card3 = Card((RANK - rank[2]), cal_e(time[2]))
        # t , b 应该和三个card
        self.t = t
        self.B = B
        self.U = U

    def get_power_point(self):
        point1 = self.t * self.card1.power * self.card1.e + self.B
        point2 = self.t * self.card2.power * self.card2.e + self.B
        point3 = self.t * self.card3.power * self.card3.e + self.B
        K = -0.5 * (self.U / GOAL) + 1.0
        point = K * (point1 + point2 + point3)

        return point

    def cal_token(self):
        p = -0.8 * (self.U / GOAL) + 1.0
        q = np.random.normal(loc=0.22, scale=0.6, size=None)
        return p * q * 100


def find_winner(point1, point2):
    deviation = point1 - point2
    play1_win = 1 / (pow(10.0, -(deviation / 1000)) + 1)
    win_num = random.random()

    if win_num <= play1_win:
        return 1
    else:
        return 2


if __name__ == "__main__":

    U_player1 = 10
    U_player2 = 10

    U_list1 = []
    Round = []

    for i in range(1, 1001):
        Round.append(i)

        random_rank = [random.randint(1, 6667) for i in range(0, 3)]
        random_time = [random.randint(0, 21) for j in range(0, 3)]

        #random_rank = [1, 2, 3]
        #random_time = [1, 1, 1]
        player1 = CardGroup(1, 0, U_player1, random_rank, random_time)

        random_rank = [random.randint(1, 6667) for i in range(0, 3)]
        random_time = [random.randint(0, 21) for j in range(0, 3)]

        #random_rank = [6666, 6665, 6664]
        #random_time = [1, 1, 1]
        player2 = CardGroup(1, 0, U_player2, random_rank, random_time)

        winner = find_winner(player1.get_power_point(), player2.get_power_point())

        if winner == 1:
            U_player1 += player1.cal_token()
            U_list1.append(U_player1)
        else:
            U_player2 += player2.cal_token()
            U_list1.append(U_player1)

        print("round:", i)
        print("player:", winner)
        print("Token:", U_player1, U_player2)

    print("FINAL:", U_player1, U_player2)


    plt.scatter(Round, U_list1)
    plt.show()


