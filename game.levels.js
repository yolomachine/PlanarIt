const presetLevels = [
    {
        points: [{ x: 400, y: 156 },
                 { x: 750, y: 241 },
                 { x: 84,  y: 233 },
                 { x: 500, y: 700 }],
        edges: [[1, 2, 3],
                [0, 2, 3],
                [1, 3, 0],
                [0, 1, 2]]
    },
    {
        points: [{ x: 513, y: 256 },
                 { x: 100, y: 700 },
                 { x: 379, y: 500 },
                 { x: 600, y: 400 },
                 { x: 333, y: 333 }],
        edges: [[1, 2, 0, 4],
                [0, 3, 1, 2],
                [4, 3, 0, 2],
                [2, 1, 0, 2]]
    },
    {
        points: [{ x: 213, y: 570 },
                 { x: 800, y: 300 },
                 { x: 850, y: 190 },
                 { x: 680, y: 100 },
                 { x: 123, y: 321 }],
        edges: [[0, 1, 2, 3, 0, 4],
                [1, 2, 3, 1, 0, 3],
                [4, 0],
                [3, 1, 2]]
    }
], minLevel = 0, maxLevel = 2;