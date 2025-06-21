import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import styles from '@/styles/header.module.css';

interface HeaderProps {
    session: Session | null;
}

export function Header({ session }: HeaderProps) {
    const [showSearchTooltip, setShowSearchTooltip] = useState(false);
    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>HubSpot Media Hub</h1>
            <div className={styles.searchContainer}>
                <input
                    type="search"
                    placeholder="Search..."
                    className={styles.searchInput}
                    onFocus={() => setShowSearchTooltip(true)}
                    onBlur={() => setShowSearchTooltip(false)}
                />
                {showSearchTooltip && (
                    <div className={styles.searchTooltip}>
                        This search bar would be used to search a database the media team sets up with everything they need, as well as global and AI search via edge functions.
                    </div>
                )}
            </div>
            <div>
                {session ? (
                    <div className={styles.userMenu}>
                        <span className={styles.email}>
                            {session.user.email}
                        </span>
                        <button onClick={handleSignOut} className={styles.button}>
                            Sign Out
                        </button>
                    </div>
                ) : (
                     <span className={styles.email}>You are not signed in.</span>
                )}
            </div>
        </header>
    );
} 