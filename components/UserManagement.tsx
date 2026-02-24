
import React, { useState } from 'react';
import { User, UserPermissions, AppConfig } from '../types';
import { Users, Plus, Trash2, Camera, ShieldCheck, ShieldAlert, Key, UserCircle, BadgeCheck, Lock, UserPlus, Info, CheckCircle2, XCircle } from 'lucide-react';
import { DEFAULT_USER_PHOTO } from '../constants';
import { generateId } from '../utils';

interface UserManagementProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  currentUser: User | null;
  config: AppConfig;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUsers, currentUser, config }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    username: '',
    password: '',
    photo: DEFAULT_USER_PHOTO,
    role: 'user',
    permissions: {
      dashboard: true,
      inventory: true,
      calculator: true,
      otgRepairs: false,
      custom: false,
      admin: false
    }
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }
    
    if (users.some(u => u.username === newUser.username)) {
        alert("Cet identifiant est déjà utilisé.");
        return;
    }

    const userToAdd: User = {
      ...newUser as User,
      id: generateId()
    };
    onUpdateUsers([...users, userToAdd]);
    setIsAdding(false);
    setNewUser({
      name: '',
      username: '',
      password: '',
      photo: DEFAULT_USER_PHOTO,
      role: 'user',
      permissions: {
        dashboard: true,
        inventory: true,
        calculator: true,
        otgRepairs: false,
        custom: false,
        admin: false
      }
    });
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) return;
    if (confirm("Voulez-vous vraiment supprimer ce compte utilisateur ? Cette action est irréversible.")) {
        onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  const togglePermission = (userId: string, permission: keyof UserPermissions) => {
    if (userId === currentUser?.id && permission === 'admin' && currentUser.role === 'admin') {
        alert("Vous ne pouvez pas retirer vos propres droits administrateur.");
        return;
    }
    const updatedUsers = users.map(u => {
        if (u.id === userId) {
            return {
                ...u,
                permissions: {
                    ...u.permissions,
                    [permission]: !u.permissions[permission]
                }
            };
        }
        return u;
    });
    onUpdateUsers(updatedUsers);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean, userId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        if (isNew) {
            setNewUser(prev => ({ ...prev, photo: photoData }));
        } else if (userId) {
            onUpdateUsers(users.map(u => u.id === userId ? { ...u, photo: photoData } : u));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-[1400px] mx-auto">
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-primary/10 rounded-3xl">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-secondary dark:text-blue-100 uppercase tracking-tight">Gestion des Utilisateurs</h2>
            <div className="flex items-center gap-4 mt-1">
               <span className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest">
                 <BadgeCheck className="w-4 h-4 text-green-500" /> {users.length} Comptes actifs
               </span>
               <span className="text-slate-200 dark:text-slate-700">|</span>
               <span className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest">
                 <Lock className="w-4 h-4 text-amber-500" /> {users.filter(u => u.role === 'admin').length} Administrateurs
               </span>
            </div>
          </div>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <UserPlus className="w-5 h-5" /> Ajouter un collaborateur
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-[3rem] p-10 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-secondary dark:text-blue-200 uppercase tracking-widest flex items-center gap-3">
              <UserCircle className="w-6 h-6 text-primary" /> Nouveau profil utilisateur
            </h3>
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <XCircle className="w-8 h-8 text-slate-300" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative group">
                    <img src={newUser.photo} className="w-40 h-40 rounded-[2.5rem] object-cover border-8 border-slate-50 dark:border-slate-800 shadow-xl" alt="Avatar Preview" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                        <div className="text-center">
                          <Camera className="text-white w-8 h-8 mx-auto mb-2" />
                          <span className="text-[10px] font-black text-white uppercase">Changer Photo</span>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} className="hidden" />
                    </label>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase max-w-[200px]">Format recommandé: Carré, max 2Mo</p>
            </div>

            <div className="xl:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Nom Complet</label>
                    <input type="text" value={newUser.name} onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-sm focus:border-primary outline-none bg-slate-50 dark:bg-slate-800" placeholder="JEAN DUPONT" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Rôle Système</label>
                    <select value={newUser.role} onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-sm bg-slate-50 dark:bg-slate-800 outline-none focus:border-primary">
                        <option value="user">UTILISATEUR STANDARD</option>
                        <option value="admin">ADMINISTRATEUR SYSTÈME</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Identifiant (Login)</label>
                    <div className="relative">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="text" value={newUser.username} onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value.toLowerCase() }))} className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-sm focus:border-primary outline-none bg-slate-50 dark:bg-slate-800" placeholder="j.dupont" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Mot de Passe</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="password" value={newUser.password} onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))} className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-sm focus:border-primary outline-none bg-slate-50 dark:bg-slate-800" placeholder="••••••••" />
                    </div>
                </div>
              </div>

              <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Matrice des Permissions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(['dashboard', 'inventory', 'calculator', 'otgRepairs', 'custom', 'admin'] as (keyof UserPermissions)[]).map(p => (
                          <button
                              key={p}
                              type="button"
                              onClick={() => setNewUser(prev => ({
                                  ...prev,
                                  permissions: { ...prev.permissions!, [p]: !prev.permissions![p] }
                              }))}
                              className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 font-black text-[10px] tracking-tight transition-all ${
                                  newUser.permissions?.[p] 
                                  ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
                              }`}
                          >
                              {p.toUpperCase()}
                              {newUser.permissions?.[p] ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-30" />}
                          </button>
                      ))}
                  </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-6">
              <button onClick={() => setIsAdding(false)} className="px-10 py-4 font-black text-slate-400 hover:text-red-500 transition-colors uppercase text-xs tracking-widest">Annuler</button>
              <button onClick={handleAddUser} className="px-12 py-5 bg-secondary dark:bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-widest">Confirmer la création</button>
          </div>
        </div>
      )}

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {users.map(user => {
          const isMe = user.id === currentUser?.id;
          return (
            <div key={user.id} className={`bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border transition-all flex flex-col group ${isMe ? 'border-primary shadow-xl shadow-primary/5' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl'}`}>
               <div className="p-8 pb-4 flex items-start justify-between">
                  <div className="relative">
                      <img src={user.photo} className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-105 transition-transform" alt={user.name} />
                      <label className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md cursor-pointer hover:bg-primary hover:text-white transition-all border border-slate-100 dark:border-slate-700">
                          <Camera className="w-4 h-4" />
                          <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, false, user.id)} className="hidden" />
                      </label>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {user.role}
                      </div>
                      {isMe && <div className="px-4 py-1.5 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">VOUS</div>}
                  </div>
               </div>

               <div className="px-8 pb-6">
                  <h4 className="text-xl font-black text-secondary dark:text-blue-100 uppercase tracking-tight truncate">{user.name}</h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mt-1">
                    <UserCircle className="w-3.5 h-3.5" /> @{user.username}
                  </p>
               </div>

               <div className="px-8 flex-1">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                     <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Accès Systèmes</span>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        {(['dashboard', 'inventory', 'calculator', 'otgRepairs', 'custom', 'admin'] as (keyof UserPermissions)[]).map(p => (
                          <button
                            key={p}
                            onClick={() => togglePermission(user.id, p)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                              user.permissions[p] 
                              ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800 text-green-600' 
                              : 'bg-transparent border-slate-100 dark:border-slate-700 text-slate-300 opacity-40'
                            }`}
                            title={p.toUpperCase()}
                          >
                            {user.permissions[p] ? <CheckCircle2 className="w-4 h-4 mb-1" /> : <XCircle className="w-4 h-4 mb-1" />}
                            <span className="text-[7px] font-black uppercase tracking-tighter truncate w-full text-center">{p}</span>
                          </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="p-8 mt-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                    <Info className="w-4 h-4" /> ID: {user.id.slice(0, 4).toUpperCase()}
                  </div>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isMe}
                    className={`p-4 rounded-2xl transition-all shadow-sm ${isMe ? 'opacity-20 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-red-400 hover:bg-red-500 hover:text-white hover:shadow-xl hover:shadow-red-500/20 active:scale-95 border border-slate-100 dark:border-slate-700'}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
