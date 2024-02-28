var Demineur = {
    nom: 'Demineur',

    difficultes: {
        debutant: {
            lignes: 9,
            colonnes: 9,
            bombes: 10,
        },
        intermediare: {
            lignes: 16,
            colonnes: 16,
            bombes: 40,
        },
        expert: {
            lignes: 22,
            colonnes: 22,
            bombes: 100,
        },
        maitre: {
            lignes: 30,
            colonnes: 30,
            bombes: 250,
        },
    },

    parametre: {
    },

    jeu: {
        statut: 0,
        champ: new Array(),
        chronoInterval: null,
    },

    classement: [],


    initialiser: function () {
        this.demarrageJeu('debutant')
    },

    demarrageJeu: function (difficulte) {
        this.parametre = this.difficultes[difficulte];
        this.dessinPlateauJeu();
        this.reinitialiserJeu();

        this.jeu.chrono = 0;
        this.majChrono();
        this.jeu.chronoInterval = setInterval(() => {
            this.jeu.chrono++;
            this.majChrono();
        }, 1000);
    },

    majChrono: function () {
        var chronoElement = document.getElementById('chrono');
        chronoElement.textContent = this.formattageTemps(this.jeu.chrono);
    },

    formattageTemps: function (timeInSeconds) {
        var hours = Math.floor(timeInSeconds / 3600);
        var minutes = Math.floor((timeInSeconds % 3600) / 60);
        var seconds = timeInSeconds % 60;
        return (
            (hours < 10 ? '0' : '') + hours + ':' +
            (minutes < 10 ? '0' : '') + minutes + ':' +
            (seconds < 10 ? '0' : '') + seconds
        );
    },


    dessinPlateauJeu: function () {

        // Recuperer le plateau du jeu et le vider  
        let tableau = document.getElementById('plateau');
        tableau.innerHTML = '';
        // Effacer le resultat de la prmiere partie 
        document.getElementById('resultat').innerHTML = '';
        // Creation de l'element table et inteTable qui represente l'interieur de la table
        bordure = document.createElement('table');
        champ = document.createElement('inteTable')
        bordure.appendChild(champ);

        bordure.className = 'champ';

        tableau.appendChild(bordure)

        // Premiere boucle pour generer les ligne. Nous alons crée autant de ligne qu'on a mit en parametre dans les lignes 6, 11, 16 et 21
        for (i = 1; i <= this.parametre['lignes']; i++) {
            ligne = document.createElement('tr');
            champ.appendChild(ligne);
        }
        // Deuxieme boucle pour crée les celulles avec des identifiants qui sont en fonction de leur position pour les manipuler un par un plus tard
        for (i = 1; i <= this.parametre['lignes']; i++) {
            ligne = document.createElement('tr');

            for (j = 1; j <= this.parametre['colonnes']; j++) {
                cellule = document.createElement('td');
                cellule.id = 'cellule-' + i + '-' + j;
                cellule.className = 'cellule';
                // Definiton de l'action du click sur chaque cellule
                cellule.setAttribute('onclick', this.nom + '.verifierPosition(' + i + ', ' + j + ');');
                // Possibiliter de marquer une cellule
                cellule.setAttribute('oncontextmenu', this.nom + '.marquerPosition(' + i + ', ' + j + '); return false;');
                ligne.appendChild(cellule);
            }
            champ.appendChild(ligne);
        }
  
    },

    afficherChampDansConsole: function () {
        console.log('Champ de jeu avec les bombes :');
        for (var i = 1; i <= this.parametre['lignes']; i++) {
            var ligne = '';
            for (var j = 1; j <= this.parametre['colonnes']; j++) {
                ligne += this.jeu.champ[i][j] + '\t';
            }
            console.log(ligne);
        }
    },



    reinitialiserJeu: function () {

        // Initialisation du terrain on met 0 dans toute les cases
        this.jeu.champ = new Array();
        for (i = 1; i <= this.parametre['lignes']; i++) {
            this.jeu.champ[i] = new Array();
            for (j = 1; j <= this.parametre['colonnes']; j++) {
                this.jeu.champ[i][j] = 0;
            }
        }

        // On va ajouter les bombes
        for (i = 1; i <= this.parametre['bombes']; i++) {
            x = Math.floor(Math.random() * (this.parametre['colonnes'] - 1) + 1);
            y = Math.floor(Math.random() * (this.parametre['lignes'] - 1) + 1);
            while (this.jeu.champ[x][y] == -1) {
                x = Math.floor(Math.random() * (this.parametre['colonnes'] - 1) + 1);
                y = Math.floor(Math.random() * (this.parametre['lignes'] - 1) + 1);
            }
            this.jeu.champ[x][y] = -1;

            for (j = x - 1; j <= x + 1; j++) {
                if (j == 0 || j == (this.parametre['colonnes'] + 1)) {
                    continue;
                }
                for (k = y - 1; k <= y + 1; k++) {
                    if (k == 0 || k == (this.parametre['lignes'] + 1)) {
                        continue;
                    }
                    if (this.jeu.champ[j][k] != -1) {
                        this.jeu.champ[j][k]++;
                    }
                }
            }
        }
        this.jeu.statut = 1;
        this.afficherChampDansConsole();
    },

    marquerPosition: function (x, y) {

        if (this.jeu.statut != 1)
            return;

        if (this.jeu.champ[x][y] == -2)
            return;

        if (this.jeu.champ[x][y] < -90) {
            document.getElementById('cellule-' + x + '-' + y).className = 'cellule';
            document.getElementById('cellule-' + x + '-' + y).innerHTML = '';
            this.jeu.champ[x][y] += 100;
        } else {
            document.getElementById('cellule-' + x + '-' + y).className = 'cellule marque';
            document.getElementById('cellule-' + x + '-' + y).innerHTML = "<img src=\"images/drapeau.png\"/>";;
            this.jeu.champ[x][y] -= 100;
        }
    },

    verifierPosition: function (x, y) {
        if (this.jeu.champ[x][y] == -1) {
            document.getElementById('cellule-' + x + '-' + y).className = 'cellule bombe';
            this.finPartie(false);
            return;
        }

        document.getElementById('cellule-' + x + '-' + y).className = 'cellule propre';

        if (this.jeu.champ[x][y] > 0) {
            document.getElementById('cellule-' + x + '-' + y).innerHTML = this.jeu.champ[x][y];
            this.jeu.champ[x][y] = -2;
        } else if (this.jeu.champ[x][y] == 0) {
            this.jeu.champ[x][y] = -2;
            for (var j = x - 1; j <= x + 1; j++) {
                if (j == 0 || j == (this.parametre['colonnes'] + 1))
                    continue;
                for (var k = y - 1; k <= y + 1; k++) {
                    if (k == 0 || k == (this.parametre['lignes'] + 1))
                        continue;
                    if (this.jeu.champ[j][k] > -1) {
                        this.verifierPosition(j, k);
                    }
                }
            }
        }

        if (this.partieGagner()) {
            this.finPartie(true);
        }
    },


    afficherPlateau: function () {
        for (var i = 1; i <= this.parametre['lignes']; i++) {
            for (var j = 1; j <= this.parametre['colonnes']; j++) {
                if (this.jeu.champ[i][j] == -1) {
                    document.getElementById('cellule-' + i + '-' + j).className = 'cellule bombe-img';
                } else if (this.jeu.champ[i][j] > 0) {
                    document.getElementById('cellule-' + i + '-' + j).className = 'cellule propre';
                    document.getElementById('cellule-' + i + '-' + j).innerHTML = this.jeu.champ[i][j];
                } else if (this.jeu.champ[i][j] == 0) {
                    document.getElementById('cellule-' + i + '-' + j).className = 'cellule propre';
                }
            }
        }

    },
    
    finPartie: function (victoire) {
        if (victoire) {
            this.affichageGagner();
        } else {
            this.affichagePerdu();
        }

        this.afficherPlateau();
        this.jeu.statut = 0;

        clearInterval(this.jeu.chronoInterval);

    },
    partieGagner: function () {
        for (var i = 1; i <= this.parametre['lignes']; i++) {
            for (var j = 1; j <= this.parametre['colonnes']; j++) {
                v = this.jeu.champ[i][j];
                if (v != -1 && v != -2 && v != -101)
                    return;
            }
        }
        this.affichageGagner();
    },

    gererClassement: function (nomJoueur, temps) {
        var score = {
            nom: nomJoueur,
            temps: temps
        };

        this.classement.push(score);
        this.classement.sort(function (a, b) {
            return a.temps - b.temps;
        });
        this.afficherClassement();
    },

    afficherClassement: function () {
        var classementElement = document.getElementById('classement');
        classementElement.innerHTML = '<h2>Classement</h2>';

        for (var i = 0; i < this.classement.length; i++) {
            classementElement.innerHTML += '<p>' + (i + 1) + '. ' + this.classement[i].nom + ' - ' + this.formattageTemps(this.classement[i].temps) + '</p>';
        }
    },

    affichageGagner: function () {
        var nomJoueur = prompt('Bravo ! Tu as gagné Romainnnn ! Entre ton nom pour sauvegarder ton score:');
        this.gererClassement(nomJoueur, this.jeu.chrono);
        this.jeu.statut = 0;
    },


    affichagePerdu: function () {
        document.getElementById('resultat').innerHTML = 'Perdu, tu est trop nullll Romainnn';
        document.getElementById('resultat').style.color = '#CC3333';
        this.jeu.statut = 0;
    },



}