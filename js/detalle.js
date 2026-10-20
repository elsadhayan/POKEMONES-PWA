const detalleContainer = document.getElementById('detalle-container');

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        cargarDetallePokemon(id);
    } else {
        detalleContainer.innerHTML = '<p>No se especificó ningún Pokémon.</p>';
    }
});

async function cargarDetallePokemon(id) {
    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const poke = await respuesta.json();

        const imagen = poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default;
        const tipos = poke.types.map(t => `<span class="badge-tipo">${t.type.name}</span>`).join(' ');
        const habilidades = poke.abilities.map(a => a.ability.name).join(', ');
        const stats = poke.stats.map(s => `<li><span>${s.stat.name.toUpperCase()}</span> <strong>${s.base_stat}</strong></li>`).join('');

        detalleContainer.innerHTML = `
            <img src="${imagen}" alt="${poke.name}">
            <h2>#${poke.id} - ${poke.name.toUpperCase()}</h2>
            <div class="tipos-container">${tipos}</div>
            <div class="info-grid">
                <p><strong>Altura:</strong> ${poke.height / 10} m</p>
                <p><strong>Peso:</strong> ${poke.weight / 10} kg</p>
            </div>
            <p class="habilidades"><strong>Habilidades:</strong> ${habilidades}</p>
            <hr class="separador">
            <h3>Estadísticas Base</h3>
            <ul class="stats-list">${stats}</ul>
        `;
    } catch (error) {
        console.error('Error al cargar detalle del pokemon:', error);
        detalleContainer.innerHTML = '<p>Error al cargar la información del Pokémon.</p>';
    }
}