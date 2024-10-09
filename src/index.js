import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';


console.log('started with webpack !');

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};

const app = initializeApp(firebaseConfig);
window.db = getFirestore(app); 

async function getFactures(db) {
    const facturesCollection = collection(db, 'factures');
    const facturesSnapshot = await getDocs(facturesCollection);
    let factures = [];
    facturesSnapshot.docs.map((doc) => {
        factures.push({ ...doc.data(), id: doc.id });
    });
    return factures;
}

async function addFacture(db, number, status) {
    try {
        const docRef = await addDoc(collection(db, "factures"), {
            number: number,
            status: status,
        });
        console.log("Facture ajoutée avec l'ID : ", docRef.id);
    } catch (e) {
        console.error("Erreur lors de l'ajout de la facture : ", e);
    }
}

async function updateFacture(id, newNumber, newStatus) {
    try {
        const factureRef = doc(db, "factures", id);
        await updateDoc(factureRef, {
            number: newNumber,
            status: newStatus
        });
        console.log("Facture mise à jour avec succès");
        displayFactures();
    } catch (e) {
        console.error("Erreur lors de la mise à jour de la facture : ", e);
    }
}

window.deleteFacture = async function(id) {
    try {
        const factureRef = doc(db, "factures", id);
        await deleteDoc(factureRef);
        console.log("Facture supprimée avec succès");
        displayFactures();
    } catch (e) {
        console.error("Erreur lors de la suppression de la facture : ", e);
    }
};

document.querySelector("#addFacture").addEventListener("submit", async (event) => {
    event.preventDefault(); 

    const number = document.querySelector("#number").value;
    const status = document.querySelector("#status").value;

    if (!number || !status) {
        console.log("Tous les champs doivent être remplis");
        return;
    }

    await addFacture(db, number, status);
    event.target.reset();
    displayFactures();
});

async function displayFactures() {
    const factures = await getFactures(db); 
    const facturesBody = document.querySelector("#facturesBody");
    facturesBody.innerHTML = ""; 
    
    factures.forEach(facture => {
        const row = document.createElement("tr");

        // Editable cells
        row.innerHTML = `
            <td contenteditable="true" onblur="saveEdit('${facture.id}', 'number', this)">${facture.number}</td>
            <td contenteditable="true" onblur="saveEdit('${facture.id}', 'status', this)">${facture.status}</td>
            <td>
                <button onclick="deleteFacture('${facture.id}')">Supprimer</button>
            </td>
        `;
        facturesBody.appendChild(row);
    });
}

window.saveEdit = (id, field, element) => {
    const newValue = element.innerText.trim();
    if (!newValue) {
        console.error("Le champ ne peut pas être vide.");
        displayFactures(); // Reset display if invalid edit
        return;
    }

    // Get current values of both fields in the row
    const row = element.closest('tr');
    const currentNumber = row.cells[0].innerText.trim();
    const currentStatus = row.cells[1].innerText.trim();

    // Prepare updated fields to avoid setting fields to null
    const updatedNumber = field === 'number' ? newValue : currentNumber;
    const updatedStatus = field === 'status' ? newValue : currentStatus;

    updateFacture(id, updatedNumber, updatedStatus);
};

displayFactures();