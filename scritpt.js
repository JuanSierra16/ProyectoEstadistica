let chartDepartments; // Variable global para almacenar la instancia del gráfico de departamentos
let chartSex; // Variable global para almacenar la instancia del gráfico de distribución por sexo
let chartAge; // Variable global para almacenar la instancia del gráfico de distribución por edad
let chartStatus; // Variable global para almacenar la instancia del gráfico de distribución de los recuperados o fallecidos
let chartInfection; // Variable global para almacenar la instancia del gráfico del tipo de contagio

// Obtener las etiquetas canvas del HTML
const ctx = document.getElementById('myChart');
const ctx2 = document.getElementById('myChart2');
const ctx3 = document.getElementById('myChart3');
const ctx4 = document.getElementById('myChart4');
const ctx5 = document.getElementById('myChart5');

function fetchData() {
    // Hacer petición a la API
    var limitInput = document.getElementById('numero-datos');
    let numDatos = limitInput.value;
    var limit = limitInput && limitInput.value ? limitInput.value : 10000;
    fetch("https://www.datos.gov.co/resource/gt2j-8ykr.json?$limit=" + limit)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error HTTP: " + response.status);
            }

            return response.json();
        })
        .then((data) => {
            const subTituloGraficas = document.getElementById('subtitulo-graficas');
            subTituloGraficas.innerHTML = `A continuación veremos las gráficas según los datos ingresados: `;
            // Contar los casos por departamento
            console.log(data);
            const casesByDepartment = {};
            data.forEach((item) => {
                const department = item.departamento_nom;
                if (casesByDepartment.hasOwnProperty(department)) {
                    casesByDepartment[department]++;
                } else {
                    casesByDepartment[department] = 1;
                }
            });
            console.log(casesByDepartment);
            // Obtener los departamentos y casos como arreglos separados
            const departments = Object.keys(casesByDepartment);
            const cases = Object.values(casesByDepartment);

            //Ordenar los departamentos y los casos
            const sortedCases = cases.slice().sort((a, b) => b - a);
            const sortedDepartments = sortedCases.map((caseCount) => {
                const index = cases.indexOf(caseCount);
                return departments[index];
            });

            // Obtener el departamento con la mayor cantidad de casos
            const maxCases = Math.max(...cases);
            const departmentWithMaxCases = departments[cases.indexOf(maxCases)];

            // Actualizar el contenido del párrafo con la información del departamento con mayor cantidad de casos
            const departamentoMayorCasos = document.getElementById('departamento-mayor-casos');
            departamentoMayorCasos.textContent = `Departamento con mayor cantidad de casos positivos: ${departmentWithMaxCases}`;

            // Llenar las opciones del select
            fillSelect(departments);

            // Contar los casos por sexo
            const casesBySex = {
                male: 0,
                female: 0
            };
            data.forEach((item) => {
                const sex = item.sexo;
                if (sex === 'M') {
                    casesBySex.male++;
                } else if (sex === 'F') {
                    casesBySex.female++;
                }
            });
            console.log(casesBySex);

            // Actualizar el contenido del párrafo con la información del departamento con mayor cantidad de casos
            if (casesBySex.male > casesBySex.female) {
                const generoMayorCasos = document.getElementById('dist-sexo');
                generoMayorCasos.innerHTML = `El sexo con mayor cantidad de casos positivos es el <strong>Masculino</strong> con: ${casesBySex.male}`;
            } else {
                const generoMayorCasos = document.getElementById('dist-sexo');
                generoMayorCasos.innerHTML = `El sexo con mayor cantidad de casos positivos es el <strong>Femenino</strong> con: ${casesBySex.female}`;
            }

            //Obtener distribucion casos por edad
            const casesByAge = {};
            data.forEach((item) => {
                const age = item.edad;

                if (casesByAge.hasOwnProperty(age)) {
                    casesByAge[age]++;
                } else {
                    casesByAge[age] = 1;
                }
            });

            const ages = Object.keys(casesByAge);
            const caseCounts = Object.values(casesByAge);

            let maxAge = '';
            let maxCaseCount = 0;

            for (const age in casesByAge) {
                if (casesByAge.hasOwnProperty(age)) {
                    const caseCount = casesByAge[age];
                    if (caseCount > maxCaseCount) {
                        maxAge = age;
                        maxCaseCount = caseCount;
                    }
                }
            }

            const edadMayorCasos = document.getElementById('edad-mayor-casos');
            edadMayorCasos.textContent = `Edad con mayor cantidad de casos positivos: ${maxAge} años (${maxCaseCount} casos)`;

            //Obtener distribucion estado recuperados-fallecidos
            const casesByStatus = {
                Recuperado: 0,
                Fallecido: 0,
                "N/A": 0,
            };

            data.forEach((item) => {
                const status = item.recuperado;
                if (status === "Recuperado") {
                    casesByStatus.Recuperado++;
                } else if (status === "Fallecido" || status == "fallecido") {
                    casesByStatus.Fallecido++;
                } else if (status === "N/A") {
                    casesByStatus["N/A"]++;
                }
            });

            const statusLabels = Object.keys(casesByStatus);
            const statusCounts = Object.values(casesByStatus);

            const parrafoEstado = document.getElementById('estado');
            parrafoEstado.innerHTML = `La cantidad de recuperados fueron: ${casesByStatus.Recuperado} y La cantidad de fallecidos fueron: ${casesByStatus.Fallecido}`;
            
            // Obtener los datos del tipo de contagio
            const contagioData = {
                Comunitaria: 0,
                Relacionado: 0,
                Importado: 0
            };

            data.forEach((item) => {
                const tipoContagio = item.fuente_tipo_contagio;
                if (tipoContagio === "Comunitaria") {
                    contagioData.Comunitaria++;
                } else if (tipoContagio === "Relacionado") {
                    contagioData.Relacionado++;
                } else if (tipoContagio === "Importado") {
                    contagioData.Importado++;
                }
            });

            // Obtener las etiquetas y los datos de la gráfica
            const contagioLabels = Object.keys(contagioData);
            const contagioCounts = Object.values(contagioData);

            const parrafoContagio = document.getElementById('contagio');
            parrafoContagio.innerHTML = `La cantidad de contagios de tipo comunitaria fueron: ${contagioData.Comunitaria}, de tipo relacionado fueron: ${contagioData.Relacionado}, y de tipo importado: ${contagioData.Importado}`;

            // Destruir los gráficos anteriores si existen
            destroyCharts();

            chartDepartments = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedDepartments,
                    datasets: [{
                        label: 'Casos positivos por departamento',
                        data: sortedCases,
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartSex = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Masculino', 'Femenino'],
                    datasets: [{
                        label: 'Distribución por Sexo',
                        data: [casesBySex.male, casesBySex.female],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartAge = new Chart(ctx3, {
                type: 'line',
                data: {
                    labels: ages,
                    datasets: [{
                        label: 'Distribución por edad',
                        data: caseCounts,
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartStatus = new Chart(ctx4, {
                type: 'pie',
                data: {
                    labels: statusLabels,
                    datasets: [{
                        label: 'Casos por estado',
                        data: statusCounts,
                        backgroundColor: ['#36A2EB', // Color para 'recuperado'
                            '#FF6384', // Color para 'fallecido'
                            '#FFCE56', // Color para 'ninguno'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartInfection = new Chart(ctx5, {
                type: 'pie',
                data: {
                    labels: contagioLabels,
                    datasets: [{
                        label: 'Casos por estado',
                        data: contagioCounts,
                        backgroundColor: ['#36A2EB', // Color para 'comunitaria'
                            '#FF6384', // Color para 'relacionado'
                            '#FFCE56', // Color para 'importado'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch((error) => console.log(error));
}

// Función para enviar el formulario
function submitForm() {
    // Obtener el número de datos y el departamento seleccionado
    const numeroDatos = document.getElementById('numero-datos').value;
    const selectedDepartamento = document.getElementById('filtro-departamento').value;
    console.log(selectedDepartamento);
    console.log(numeroDatos);

    // Verificar si se ingresó un número válido y el departamento seleccionado
    if (numeroDatos > 0) {
        // Llamar a la función fetchData() o mostrarDatosPorDepartamento() según corresponda
        if (selectedDepartamento === '') {
            fetchData();
        } else {
            mostrarDatosPorDepartamento(selectedDepartamento, numeroDatos);
        }
    }
}

// Función para mostrar los datos y gráficas según el departamento seleccionado
function mostrarDatosPorDepartamento(departamento, numeroDatos) {

    let url = "https://www.datos.gov.co/resource/gt2j-8ykr.json?$limit=" + numeroDatos;

    if (departamento !== '') {
        url += "&departamento_nom=" + encodeURIComponent(departamento);
    }
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error HTTP: " + response.status);
            }

            return response.json();
        })
        .then((data) => {
            //Poner nombre del departamento en el subtitulo
            const subTituloGraficas = document.getElementById('subtitulo-graficas');
            subTituloGraficas.innerHTML = `A continuación veremos las gráficas según los datos ingresados: ${numeroDatos} datos del departamento de ${departamento}`

            // Filtrar los datos por departamento
            const filteredData = data.filter((item) => item.departamento_nom === departamento);

            // Contar los casos por departamento
            console.log(data);
            const casesByDepartment = {};
            filteredData.forEach((item) => {
                const department = item.departamento_nom;
                if (casesByDepartment.hasOwnProperty(department)) {
                    casesByDepartment[department]++;
                } else {
                    casesByDepartment[department] = 1;
                }
            });
            console.log(casesByDepartment);
            // Obtener los departamentos y casos como arreglos separados
            const departments = Object.keys(casesByDepartment);
            const cases = Object.values(casesByDepartment);

            // Obtener el departamento con la mayor cantidad de casos
            const maxCases = Math.max(...cases);
            const departmentWithMaxCases = departments[cases.indexOf(maxCases)];

            // Actualizar el contenido del párrafo con la información del departamento con mayor cantidad de casos
            const departamentoMayorCasos = document.getElementById('departamento-mayor-casos');
            departamentoMayorCasos.textContent = `Departamento con mayor cantidad de casos positivos: ${departmentWithMaxCases}`;

            // Contar los casos por sexo
            const casesBySex = {
                male: 0,
                female: 0
            };
            filteredData.forEach((item) => {
                const sex = item.sexo;
                if (sex === 'M') {
                    casesBySex.male++;
                } else if (sex === 'F') {
                    casesBySex.female++;
                }
            });
            console.log(casesBySex);

            // Actualizar el contenido del párrafo con la información del departamento con mayor cantidad de casos
            if (casesBySex.male > casesBySex.female) {
                const generoMayorCasos = document.getElementById('dist-sexo');
                generoMayorCasos.innerHTML = `El sexo con mayor cantidad de casos positivos es el <strong>Masculino</strong> con: ${casesBySex.male}`;
            } else {
                const generoMayorCasos = document.getElementById('dist-sexo');
                generoMayorCasos.innerHTML = `El sexo con mayor cantidad de casos positivos es el <strong>Femenino</strong> con: ${casesBySex.female}`;
            }

            //Obtener distribucion casos por edad
            const casesByAge = {};
            filteredData.forEach((item) => {
                const age = item.edad;

                if (casesByAge.hasOwnProperty(age)) {
                    casesByAge[age]++;
                } else {
                    casesByAge[age] = 1;
                }
            });

            const ages = Object.keys(casesByAge);
            const caseCounts = Object.values(casesByAge);

            let maxAge = '';
            let maxCaseCount = 0;

            for (const age in casesByAge) {
                if (casesByAge.hasOwnProperty(age)) {
                    const caseCount = casesByAge[age];
                    if (caseCount > maxCaseCount) {
                        maxAge = age;
                        maxCaseCount = caseCount;
                    }
                }
            }

            const edadMayorCasos = document.getElementById('edad-mayor-casos');
            edadMayorCasos.textContent = `Edad con mayor cantidad de casos positivos: ${maxAge} años (${maxCaseCount} casos)`;

            //Obtener distribucion estado recuperados-fallecidos
            const casesByStatus = {
                Recuperado: 0,
                Fallecido: 0,
                "N/A": 0,
            };

            data.forEach((item) => {
                const status = item.recuperado;
                if (status === "Recuperado") {
                    casesByStatus.Recuperado++;
                } else if (status === "Fallecido" || status == "fallecido") {
                    casesByStatus.Fallecido++;
                } else if (status === "N/A") {
                    casesByStatus["N/A"]++;
                }
            });

            const statusLabels = Object.keys(casesByStatus);
            const statusCounts = Object.values(casesByStatus);

            const parrafoEstado = document.getElementById('estado');
            parrafoEstado.innerHTML = `La cantidad de recuperados fueron: ${casesByStatus.Recuperado} y La cantidad de fallecidos fueron: ${casesByStatus.Fallecido}`;

            // Obtener los datos del tipo de contagio
            const contagioData = {
                Comunitaria: 0,
                Relacionado: 0,
                Importado: 0
            };

            data.forEach((item) => {
                const tipoContagio = item.fuente_tipo_contagio;
                if (tipoContagio === "Comunitaria") {
                    contagioData.Comunitaria++;
                } else if (tipoContagio === "Relacionado") {
                    contagioData.Relacionado++;
                } else if (tipoContagio === "Importado") {
                    contagioData.Importado++;
                }
            });

            // Obtener las etiquetas y los datos de la gráfica
            const contagioLabels = Object.keys(contagioData);
            const contagioCounts = Object.values(contagioData);

            const parrafoContagio = document.getElementById('contagio');
            parrafoContagio.innerHTML = `La cantidad de contagios de tipo comunitaria fueron: ${contagioData.Comunitaria}, de tipo relacionado fueron: ${contagioData.Relacionado}, y de tipo importado: ${contagioData.Importado}`;

            // Destruir los gráficos anteriores si existen
            destroyCharts();

            chartDepartments = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: departments,
                    datasets: [{
                        label: 'Casos positivos por departamento',
                        data: cases,
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartSex = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Masculino', 'Femenino'],
                    datasets: [{
                        label: 'Distribución por Sexo',
                        data: [casesBySex.male, casesBySex.female],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartAge = new Chart(ctx3, {
                type: 'line',
                data: {
                    labels: ages,
                    datasets: [{
                        label: 'Distribución por edad',
                        data: caseCounts,
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartStatus = new Chart(ctx4, {
                type: 'pie',
                data: {
                    labels: statusLabels,
                    datasets: [{
                        label: 'Casos por estado',
                        data: statusCounts,
                        backgroundColor: ['#36A2EB', // Color para 'recuperado'
                            '#FF6384', // Color para 'fallecido'
                            '#FFCE56', // Color para 'ninguno'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartInfection = new Chart(ctx5, {
                type: 'pie',
                data: {
                    labels: contagioLabels,
                    datasets: [{
                        label: 'Casos por estado',
                        data: contagioCounts,
                        backgroundColor: ['#36A2EB', // Color para 'comunitaria'
                            '#FF6384', // Color para 'relacionado'
                            '#FFCE56', // Color para 'importado'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch((error) => console.log(error));
}

function fillSelect(departments) {
    // Obtener el elemento <select>
    const filtroDepartamento = document.getElementById('filtro-departamento');

    // Limpiar las opciones existentes
    filtroDepartamento.innerHTML = '';

    // Agregar la opción "Todos los departamentos"
    const opcionTodos = document.createElement('option');
    opcionTodos.value = '';
    opcionTodos.textContent = 'Todos los departamentos';
    filtroDepartamento.appendChild(opcionTodos);

    // Ordenar los departamentos alfabéticamente
    let orderDepartments = departments.slice().sort();

    // Agregar las opciones de departamentos en orden alfabético
    orderDepartments.forEach((department) => {
        const opcion = document.createElement('option');
        opcion.value = department;
        opcion.textContent = department;
        filtroDepartamento.appendChild(opcion);
    });
}

function destroyCharts() {
    const charts = [chartDepartments, chartSex, chartAge, chartStatus, chartInfection];
    charts.forEach((chart) => {
        if (chart) {
            chart.destroy();
        }
    });
}

fetchData();