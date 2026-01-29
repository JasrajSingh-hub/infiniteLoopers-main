const MOCK_DATA = {
    currentUser: {
        name: "Nurse Sarah",
        role: "Head Nurse",
        id: "N-102"
    },
    stats: {
        totalPatients: 12,
        critical: 2,
        stable: 8,
        discharged: 4
    },
    patients: [
        {
            id: "P-1001",
            name: "Eleanor Rigby",
            age: 72,
            gender: "Female",
            room: "304-A",
            status: "Stable",
            diagnosis: "Hypertension",
            admissionDate: "2023-10-15",
            vitals: {
                bp: "128/82",
                hr: "76 bpm",
                temp: "98.6 °F",
                spo2: "98%"
            },
            history: [
                { date: "Oct 15", value: 140 }, // Systolic BP
                { date: "Oct 16", value: 135 },
                { date: "Oct 17", value: 130 },
                { date: "Oct 18", value: 128 },
                { date: "Oct 19", value: 128 }
            ]
        },
        {
            id: "P-1002",
            name: "John Doe",
            age: 45,
            gender: "Male",
            room: "201-B",
            status: "Critical",
            diagnosis: "Post-op Cardiac",
            admissionDate: "2023-10-18",
            vitals: {
                bp: "110/70",
                hr: "88 bpm",
                temp: "99.1 °F",
                spo2: "94%"
            },
            history: [
                { date: "Oct 18", value: 100 },
                { date: "Oct 19", value: 105 },
                { date: "Oct 19 PM", value: 110 }
            ]
        },
        {
            id: "P-1003",
            name: "Alice Smith",
            age: 29,
            gender: "Female",
            room: "105-C",
            status: "Recovering",
            diagnosis: "Appendicitis",
            admissionDate: "2023-10-19",
            vitals: {
                bp: "118/75",
                hr: "72 bpm",
                temp: "98.4 °F",
                spo2: "99%"
            },
            history: [
                { date: "Oct 19", value: 122 },
                { date: "Oct 20", value: 118 }
            ]
        },
        {
            id: "P-1004",
            name: "Michael Chen",
            age: 58,
            gender: "Male",
            room: "305-A",
            status: "Stable",
            diagnosis: "Type 2 Diabetes",
            admissionDate: "2023-10-12",
            vitals: {
                bp: "135/85",
                hr: "80 bpm",
                temp: "98.2 °F",
                spo2: "97%"
            },
            history: []
        },
        {
            id: "P-1005",
            name: "Sarah Jones",
            age: 64,
            gender: "Female",
            room: "302-B",
            status: "Stable",
            diagnosis: "Pneumonia",
            admissionDate: "2023-10-14",
            vitals: {
                bp: "125/80",
                hr: "78 bpm",
                temp: "98.8 °F",
                spo2: "96%"
            },
            history: []
        },
        {
             id: "P-1006",
             name: "Robert Brown",
             age: 81,
             gender: "Male",
             room: "401-A",
             status: "Critical",
             diagnosis: "Stroke",
             admissionDate: "2023-10-20",
             vitals: {
                 bp: "150/95",
                 hr: "92 bpm",
                 temp: "98.5 °F",
                 spo2: "92%"
             },
             history: []
        }
    ]
};
