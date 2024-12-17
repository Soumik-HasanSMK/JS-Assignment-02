document.addEventListener("DOMContentLoaded", () => {
    const playerList = document.getElementById('player-list');
    const playerCartList = document.getElementById('player-cart');
    const playerCount = document.getElementById('player-count');
    const searchInput = document.getElementById('player-search');
    const searchButton = document.getElementById('search-button');
    const playerCart = [];
    const maxPlayers = 10;

    fetchPlayers('');

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        fetchPlayers(query);
    });

    async function fetchPlayers(query) {
        const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${query}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            displayPlayers(data.player);
        } catch (error) {
            console.error("Fetch error:", error);
            alert("An error occurred while fetching the data.");
        }
    }

    function displayPlayers(players) {
        playerList.innerHTML = '';

        if (players) {
            players.forEach(player => {
                const isHired = playerCart.find(cartPlayer => cartPlayer.idPlayer === player.idPlayer);
                const playerCard = document.createElement('div');
                playerCard.classList.add('col'); // Bootstrap class for grid layout
                playerCard.innerHTML = `
                    <div class="card">
                        <img src="${player.strThumb || 'empty.png'}" class="card-img-top" alt="${player.strPlayer}" onerror="this.onerror=null;this.src='empty.png';">
                        <div class="card-body">
                            <h5 class="card-title">${player.strPlayer}</h5>
                            <p class="card-text"><strong>Nationality:</strong> ${player.strNationality}</p>
                            <p class="card-text"><strong>Team:</strong> ${player.strTeam || 'N/A'}</p>
                            <p class="card-text"><strong>Gender:</strong> ${player.strGender}</p>
                            <button class="btn btn-primary details-btn" data-id="${player.idPlayer}">Details</button>
                            <button class="btn btn-success hire-btn" data-id="${player.idPlayer}" ${isHired ? 'disabled' : ''}>
                                ${isHired ? 'Already Hired' : 'Hire'}
                            </button>
                        </div>
                    </div>
                `;
                playerList.appendChild(playerCard);
            });

            document.querySelectorAll('.details-btn').forEach(btn => {
                btn.addEventListener('click', event => {
                    const playerId = event.target.getAttribute('data-id');
                    showPlayerDetails(playerId);
                });
            });

            document.querySelectorAll('.hire-btn').forEach(btn => {
                btn.addEventListener('click', event => {
                    const playerId = event.target.getAttribute('data-id');
                    hirePlayer(playerId, btn);
                });
            });
        } else {
            playerList.innerHTML = '<p>No results found.</p>';
        }
    }

    async function showPlayerDetails(playerId) {
        const url = `https://www.thesportsdb.com/api/v1/json/3/lookupplayer.php?id=${playerId}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            console.log(data); // Log the data for debugging
            if (data.players && data.players.length > 0) {
                const player = data.players[0];
                const modalBody = document.getElementById('player-details');
                modalBody.innerHTML = `
                    <img src="${player.strThumb || 'empty.png'}" class="img-fluid mb-3" alt="${player.strPlayer}" onerror="this.onerror=null;this.src='empty.png';">
                    <h5>${player.strPlayer}</h5>
                    <p><strong>Nationality:</strong> ${player.strNationality}</p>
                    <p><strong>Team:</strong> ${player.strTeam || 'N/A'}</p>
                    <p><strong>Gender:</strong> ${player.strGender}</p>
                    <p><strong>Description:</strong> ${player.strDescriptionEN || 'No description available.'}</p>
                    ${getSocialMediaLinks(player)}
                `;
                const modal = new bootstrap.Modal(document.getElementById('playerModal'));
                modal.show();
            } else {
                throw new Error("Player details not found");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("An error occurred while fetching the player details.");
        }
    }


    function getSocialMediaLinks(player) {
        const socialLinks = [];
        if (player.strFacebook) {
            socialLinks.push(`<a href="https://${player.strFacebook}" target="_blank" class="btn btn-primary me-2"><i class="fab fa-facebook"></i> Facebook</a>`);
        }
        if (player.strTwitter) {
            socialLinks.push(`<a href="https://${player.strTwitter}" target="_blank" class="btn btn-info me-2"><i class="fab fa-twitter"></i> Twitter</a>`);
        }
        if (player.strInstagram) {
            socialLinks.push(`<a href="https://${player.strInstagram}" target="_blank" class="btn btn-danger me-2"><i class="fab fa-instagram"></i> Instagram</a>`);
        }
        if (player.strYoutube) {
            socialLinks.push(`<a href="https://${player.strYoutube}" target="_blank" class="btn btn-danger me-2"><i class="fab fa-youtube"></i> YouTube</a>`);
        }
        return socialLinks.length > 0 ? `<p><strong>Social Media:</strong></p>${socialLinks.join('')}` : '';
    }

    function hirePlayer(playerId, button) {
        if (playerCart.length >= maxPlayers) {
            alert("You can only hire up to 10 players.");
            return;
        }

        const playerAlreadyHired = playerCart.find(player => player.idPlayer === playerId);
        if (playerAlreadyHired) {
            alert("Player is already hired.");
            return;
        }

        const url = `https://www.thesportsdb.com/api/v1/json/3/lookupplayer.php?id=${playerId}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const player = data.players[0];
                playerCart.push(player);
                updatePlayerCart();
                button.textContent = 'Already Hired';
                button.disabled = true;
                alert(`${player.strPlayer} has been hired!`);
            })
            .catch(error => {
                console.error("Fetch error:", error);
                alert("An error occurred while hiring the player.");
            });
    }

    function updatePlayerCart() {
        playerCartList.innerHTML = '';
        playerCart.forEach(player => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.innerHTML = `
                <div>
                    <p><strong>Name: </strong>${player.strPlayer}</strong></p>
                    <p>Nationality: ${player.strNationality}</p>
                    <p>Sports: ${player.strSport}</p>
                    <p>Gender: ${player.strGender}</p>
                    <button class="btn btn-danger btn-sm remove-btn" data-id="${player.idPlayer}">Remove</button>
                </div>
            `;
            playerCartList.appendChild(listItem);
        });
        playerCount.textContent = `(${playerCart.length})`;

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', event => {
                const playerId = event.target.getAttribute('data-id');
                removePlayer(playerId);
            });
        });
    }

    function removePlayer(playerId) {
        const playerIndex = playerCart.findIndex(player => player.idPlayer === playerId);
        if (playerIndex !== -1) {
            playerCart.splice(playerIndex, 1);
            updatePlayerCart();
            fetchPlayers(searchInput.value.trim());
        }
    }
});
