import {db, firebaseAuth} from '../firebase/firebase'
import {
    createUserWithEmailAndPassword,
    deleteUser as authDeleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    updateEmail,
    updatePassword,
} from 'firebase/auth'
import {
    collection,
    doc as firestoreDoc,
    getDoc as firestoreGetDoc,
    getDocs,
    query,
    setDoc as firestoreSetDoc,
    where,
} from 'firebase/firestore'

const usersCollection = collection(db, 'users')

function userDocument(userId) {
    return firestoreDoc(usersCollection, userId)
}

const deleteUser = async (userId) => {
    try {
        const user = await firebaseAuth.currentUser;
        await authDeleteUser(user);
        console.log('User deleted from authentication successfully');
    } catch (error) {
        console.error('Error deleting user from authentication:', error);
    }
};

const readUser = async (userId) => {
    try {
        const userSnapshot = await firestoreGetDoc(userDocument(userId))
        if (userSnapshot.exists()) {
            return userSnapshot.data()
        } else {
            console.log('User not found')
            return null
        }
    } catch (error) {
        console.error('Error reading user:', error)
        return null
    }
}

const updateUser = async (userId: string, newEmail?: string, newName?: string, newPix?: string) => {
    try {
        const userIdExists = await checkUserIdExists(user.userId);

        if (!userIdExists) {
            console.error('User does not exists');
            return;
        }

        if (typeof newEmail !== 'undefined') {
            await firestoreUpdateDoc(userDocument(userId), {email: newEmail});
        }
        if (typeof newName !== 'undefined') {
            await firestoreUpdateDoc(userDocument(userId), {name: newName});
        }
        if (typeof newPix !== 'undefined') {
            await firestoreUpdateDoc(userDocument(userId), {pix: newPix});
        }
        console.log('User updated successfully');

    } catch (error) {
        console.error('Error updating user:', error);
    }
};

const checkUserIdExists = async (userId) => {
    const userSnapshot = await firestoreGetDoc(userDocument(userId))
    return userSnapshot.exists()
}

const checkPixExists = async (pix) => {
    try {
        const usersRef = collection(db, 'users')
        const emailQuery = query(usersRef, where('pix', '==', pix))
        const querySnapshot = await getDocs(emailQuery)

        return !querySnapshot.empty
    } catch (error) {
        console.error('Error checking email:', error)
        return false
    }
}

const checkEmailExists = async (email) => {
    try {
        const usersRef = collection(db, 'users')
        const emailQuery = query(usersRef, where('email', '==', email))
        const querySnapshot = await getDocs(emailQuery)

        return !querySnapshot.empty
    } catch (error) {
        console.error('Error checking email:', error)
        return false
    }
}

const generateUserId = () => {
    return firestoreDoc(usersCollection).id
}

const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password)
        return userCredential.user
    } catch (error) {
        console.log(error)
        return error
    }
}

const signOut = async () => {
    try {
        await firebaseAuth.signOut()
        return true // Sign-out was successful
    } catch (error) {
        console.error('Error signing out:', error)
        return false // Sign-out failed
    }
}

const signup = async (email, password, name, pix) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            firebaseAuth,
            email,
            password
        )
        const user = userCredential.user

        const userDocumentData = {
            userId: user.uid,
            groups: [],
            email: email,
            name: name,
            pix: pix,
        }

        await firestoreSetDoc(userDocument(user.uid), userDocumentData)

        return userDocumentData
    } catch (error) {
        console.log(error)
        return false
    }
}

const getUsers = async () => {
    const snapshot = await getDocs(usersCollection)
    return snapshot.docs.map((doc) => doc.data())
}

const getUserData = async (userId) => {
    try {
        const userSnapshot = await firestoreGetDoc(userDocument(userId))
        if (userSnapshot.exists()) {
            const userData = userSnapshot.data()
            // @ts-ignore
            const groupIds = userData.groups || []
            // @ts-ignore
            const userDebts = userData.debts || []
            return {
                userDetails: userData,
                groupIds,
                userDebts,
            }
        } else {
            console.log('User not found')
            return null
        }
    } catch (error) {
        console.error('Error reading user data:', error)
        return null
    }
}

const getUserByEmail = async (userEmail) => {
    try {
        // Assuming you have a way to query users by email in your database
        const usersRef = collection(db, 'users')
        const emailQuery = query(usersRef, where('email', '==', userEmail))
        const querySnapshot = await getDocs(emailQuery)

        if (!querySnapshot.empty) {
            // Assuming there's only one user with a given email
            const userDoc = querySnapshot.docs[0]
            return userDoc.id // Return the userId
        } else {
            console.log('User not found by email:', userEmail)
            return null
        }
    } catch (error) {
        console.error('Error getting user by email:', error)
        return null
    }
}

const updateUserName = async (userId, newName) => {
    try {
        const userDoc = userDocument(userId)
        await firestoreSetDoc(userDoc, {name: newName}, {merge: true})
        console.log('   ')
    } catch (error) {
        console.error('Error updating user name:', error)
    }
}

const updateUserEmail = async (userId, newEmail) => {
    try {
        const user = firebaseAuth.currentUser

        // @ts-ignore
        await updateEmail(user, newEmail)

        const userDoc = userDocument(userId)
        await firestoreSetDoc(userDoc, {email: newEmail}, {merge: true})

        console.log('E-mail atualizado com sucesso')
    } catch (error) {
        console.error('Erro ao atualizar o e-mail:', error)
        throw error
    }
}

const updateUserPassword = async (oldPassword, newPassword) => {
    try {
        const user = firebaseAuth.currentUser
        // @ts-ignore
        const credential = EmailAuthProvider.credential(user.email, oldPassword)

        // @ts-ignore
        await reauthenticateWithCredential(user, credential)
        // @ts-ignore
        await updatePassword(user, newPassword)

        console.log('Senha atualizada com sucesso')
    } catch (error) {
        console.error('Erro ao atualizar a senha:', error)
        throw error
    }
}

export {
    deleteUser,
    readUser,
    generateUserId,
    login,
    signup,
    getUsers,
    userDocument,
    getUserData,
    getUserByEmail,
    signOut,
    updateUserName,
    updateUserEmail,
    updateUserPassword,
}
