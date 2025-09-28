/**
 * ChartManager - Управление графиками
 * Использует Chart.js для визуализации данных
 */
class ChartManager {
    constructor() {
        this.charts = new Map();
        this.colors = {
            pessimistic: '#dc2626',
            base: '#2563eb',
            optimistic: '#059669',
            stocks: '#059669',
            bonds: '#2563eb',
            cash: '#d97706',
            realty: '#7c3aed'
        };
    }

    /**
     * Создание или обновление графика сценариев
     * @param {HTMLCanvasElement} canvas - Canvas элемент
     * @param {Object} projections - Проекции по сценариям
     * @param {Object} settings - Настройки отображения
     */
    createScenariosChart(canvas, projections, settings = {}) {
        const chartId = 'scenarios';

        // Уничтожаем существующий график
        if (this.charts.has(chartId)) {
            this.charts.get(chartId).destroy();
        }

        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'line',
            data: this.prepareScenariosData(projections, settings),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Прогноз развития портфеля',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: ${this.formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Годы'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: settings.showRealValues ? 'Чистая стоимость (реальная)' : 'Чистая стоимость (номинальная)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: (value) => this.formatCompactCurrency(value)
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.2
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });

        this.charts.set(chartId, chart);
        return chart;
    }

    /**
     * Создание или обновление графика состава портфеля
     * @param {HTMLCanvasElement} canvas - Canvas элемент
     * @param {Object} portfolio - Портфель активов
     */
    createCompositionChart(canvas, portfolio) {
        const chartId = 'composition';

        // Уничтожаем существующий график
        if (this.charts.has(chartId)) {
            this.charts.get(chartId).destroy();
        }

        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: this.prepareCompositionData(portfolio),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Состав портфеля',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, index) => ({
                                    text: `${label}: ${data.datasets[0].percentage[index]}%`,
                                    fillStyle: data.datasets[0].backgroundColor[index],
                                    strokeStyle: data.datasets[0].backgroundColor[index],
                                    pointStyle: 'circle'
                                }));
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                const percentage = context.dataset.percentage[context.dataIndex];
                                return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '50%'
            }
        });

        this.charts.set(chartId, chart);
        return chart;
    }

    /**
     * Подготовка данных для графика сценариев
     */
    prepareScenariosData(projections, settings) {
        if (!projections.base || projections.base.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = projections.base.map(item => item.year);

        const datasets = [
            {
                label: 'Пессимистичный',
                data: projections.pessimistic.map(item =>
                    settings.showRealValues ? item.real : (item.netWorth !== undefined ? item.netWorth : item.nominal)
                ),
                borderColor: this.colors.pessimistic,
                backgroundColor: this.colors.pessimistic + '20',
                borderWidth: 2,
                fill: false
            },
            {
                label: 'Базовый',
                data: projections.base.map(item =>
                    settings.showRealValues ? item.real : (item.netWorth !== undefined ? item.netWorth : item.nominal)
                ),
                borderColor: this.colors.base,
                backgroundColor: this.colors.base + '20',
                borderWidth: 3,
                fill: false
            },
            {
                label: 'Оптимистичный',
                data: projections.optimistic.map(item =>
                    settings.showRealValues ? item.real : (item.netWorth !== undefined ? item.netWorth : item.nominal)
                ),
                borderColor: this.colors.optimistic,
                backgroundColor: this.colors.optimistic + '20',
                borderWidth: 2,
                fill: false
            }
        ];

        return { labels, datasets };
    }

    /**
     * Подготовка данных для графика состава портфеля
     */
    prepareCompositionData(portfolio) {
        if (!portfolio.assets || portfolio.assets.length === 0) {
            return { labels: [], datasets: [] };
        }

        const assetTypes = {};
        const totalValue = portfolio.totalValue || 0;

        // Группируем активы по типам
        portfolio.assets.forEach(asset => {
            if (!assetTypes[asset.type]) {
                assetTypes[asset.type] = 0;
            }
            assetTypes[asset.type] += asset.value || 0;
        });

        const labels = Object.keys(assetTypes).map(type => this.getAssetTypeName(type));
        const data = Object.values(assetTypes);
        const backgroundColor = Object.keys(assetTypes).map(type => this.colors[type] || '#64748b');
        const percentage = data.map(value =>
            totalValue > 0 ? Math.round((value / totalValue) * 100) : 0
        );

        return {
            labels,
            datasets: [{
                data,
                backgroundColor,
                borderColor: backgroundColor.map(color => color + 'ff'),
                borderWidth: 2,
                percentage
            }]
        };
    }

    /**
     * Обновление существующего графика
     * @param {string} chartId - ID графика
     * @param {Object} newData - Новые данные
     */
    updateChart(chartId, newData) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.data = newData;
            chart.update('none'); // Без анимации для лучшей производительности
        }
    }

    /**
     * Получение названия типа актива
     */
    getAssetTypeName(type) {
        const names = {
            stocks: 'Акции',
            bonds: 'Облигации',
            cash: 'Депозиты',
            realty: 'Недвижимость'
        };
        return names[type] || type;
    }

    /**
     * Форматирование валюты
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    /**
     * Компактное форматирование валюты для осей
     */
    formatCompactCurrency(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M₽';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K₽';
        }
        return amount.toFixed(0) + '₽';
    }

    /**
     * Уничтожение всех графиков
     */
    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * Уничтожение конкретного графика
     */
    destroy(chartId) {
        if (this.charts.has(chartId)) {
            this.charts.get(chartId).destroy();
            this.charts.delete(chartId);
        }
    }

    /**
     * Получение списка активных графиков
     */
    getActiveCharts() {
        return Array.from(this.charts.keys());
    }

    /**
     * Изменение размера всех графиков
     */
    resize() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
}

// Создаем глобальный экземпляр
window.chartManager = new ChartManager();

// Экспортируем класс
window.ChartManager = ChartManager;