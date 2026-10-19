from typing import NamedTuple


class NamePool(NamedTuple):
    first: tuple[str, ...]
    last: tuple[str, ...]


def pool(first: str, last: str) -> NamePool:
    return NamePool(tuple(first.split()), tuple(last.split()))


NAME_POOLS = {
    "western": pool(
        """James Mary John Patricia Robert Jennifer Michael Linda William Elizabeth David Barbara
        Richard Susan Joseph Jessica Thomas Sarah Charles Karen Christopher Lisa Daniel Nancy
        Matthew Betty Anthony Margaret Mark Sandra Donald Ashley Steven Emily Paul Kimberly Andrew
        Donna Joshua Michelle Kenneth Carol Kevin Amanda Brian Melissa George Deborah Timothy
        Stephanie Ryan Rebecca Jacob Laura Ethan Olivia Benjamin Hannah Samuel Grace Nathan Chloe
        Henry Ava Jack Lily Oliver Isabella Liam Sophia""",
        """Smith Johnson Williams Brown Jones Miller Davis Wilson Anderson Taylor Thomas Moore
        Martin Jackson Thompson White Harris Clark Lewis Robinson Walker Young Allen King Wright
        Scott Hill Green Adams Baker Nelson Carter Mitchell Roberts Turner Phillips Campbell Parker
        Evans Edwards Collins Stewart Morris Murphy Cook Rogers Morgan Cooper Peterson Bailey Reed
        Kelly Howard Ward Hughes Bennett Brooks Butler Foster Gray Hayes Jenkins Long Price Russell
        Sanders Simmons Watson Wood Fisher""",
    ),
    "india": pool(
        """Aarav Vivaan Aditya Vihaan Arjun Sai Reyansh Ayaan Krishna Ishaan Rohan Kabir Rahul
        Vikram Karan Nikhil Siddharth Anirudh Pranav Varun Aanya Diya Priya Ananya Saanvi Aditi
        Kavya Riya Isha Meera Neha Pooja Shreya Tanvi Nisha Divya Sneha Lakshmi Anjali Kiara Arnav
        Dhruv Atharv Yash Harsh Manav Aryan Tara Nandini Rhea Sara Avni""",
        """Sharma Verma Gupta Patel Shah Mehta Iyer Nair Reddy Rao Singh Kumar Joshi Desai Kulkarni
        Menon Pillai Chopra Malhotra Kapoor Bhatia Saxena Agarwal Banerjee Chatterjee Mukherjee Das
        Bose Sen Ghosh Jain Trivedi Pandey Mishra Tiwari Yadav Naidu Hegde Shetty Krishnan Bhat
        Chauhan Dutta Goswami Kaur Mathur Rastogi Sinha Thakur Vaidya""",
    ),
    "germany": pool(
        """Lukas Leon Finn Jonas Paul Felix Elias Noah Max Ben Lena Hannah Mia Emma Lea Anna Lina
        Marie Sophie Laura Jan Tim Niklas Moritz Julian Clara Greta Johanna Frieda Paula""",
        """Muller Schmidt Schneider Fischer Weber Meyer Wagner Becker Schulz Hoffmann Koch Bauer
        Richter Klein Wolf Schroder Neumann Schwarz Zimmermann Braun Kruger Hofmann Hartmann Lange
        Schmitt Werner Krause Meier Lehmann Schmid""",
    ),
    "france": pool(
        """Lucas Louis Hugo Gabriel Arthur Jules Adam Raphael Paul Nathan Emma Jade Louise Alice
        Chloe Lina Lea Manon Camille Ines Theo Mathis Clement Antoine Maxime Juliette Margaux
        Pauline Elise Sarah""",
        """Blanc Bernard Dubois Faure Robert Richard Petit Durand Leroy Moreau Simon Laurent
        Lefebvre Michel Garcia David Bertrand Roux Vincent Fournier Morel Girard Andre Mercier
        Dupont Lambert Bonnet Francois Martinez Legrand""",
    ),
    "japan": pool(
        """Haruto Yuto Sota Yuki Hayato Haruki Ren Kaito Riku Takumi Sakura Yui Hina Aoi Rin Mio
        Yuna Akari Saki Mei Kenji Hiroshi Takeshi Daiki Shota Ayaka Misaki Nanami Haruka Kaori""",
        """Sato Suzuki Takahashi Tanaka Watanabe Ito Yamamoto Nakamura Kobayashi Kato Yoshida
        Yamada Sasaki Yamaguchi Matsumoto Inoue Kimura Hayashi Shimizu Yamazaki Mori Abe Ikeda
        Hashimoto Yamashita Ishikawa Nakajima Maeda Fujita Ogawa""",
    ),
    "brazil": pool(
        """Miguel Arthur Heitor Bernardo Davi Theo Lorenzo Gabriel Pedro Rafael Helena Alice Laura
        Manuela Valentina Sophia Isabella Heloisa Luiza Julia Lucas Matheus Gustavo Felipe Thiago
        Beatriz Mariana Larissa Camila Leticia""",
        """Silva Santos Oliveira Souza Rodrigues Ferreira Alves Pereira Lima Gomes Costa Ribeiro
        Martins Carvalho Almeida Lopes Soares Fernandes Vieira Barbosa Rocha Dias Nascimento
        Andrade Moreira Nunes Marques Machado Mendes Freitas""",
    ),
    "singapore": pool(
        """Wei Jun Ming Hui Xin Jia Kai Zhi Li Mei Ahmad Nur Siti Farah Hafiz Aisyah Ravi Kavitha
        Arun Deepa Daniel Rachel Marcus Joanne Bryan Cheryl Ethan Natalie Shawn Valerie""",
        """Tan Lim Lee Ng Ong Wong Goh Chua Chan Koh Teo Ang Yeo Tay Ho Low Toh Sim Chong Chia Lau
        Yap Foo Seah Ismail Rahman Hassan Kumar Pillai Nair""",
    ),
}

NAME_REGION = {
    "US": "western",
    "GB": "western",
    "CA": "western",
    "AU": "western",
    "IN": "india",
    "DE": "germany",
    "FR": "france",
    "JP": "japan",
    "BR": "brazil",
    "SG": "singapore",
}
