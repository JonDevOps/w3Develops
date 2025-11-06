export type UserProfile = {
    userId: string;
    username: string;
    displayName: string;
    profilePictureUrl: string;
    socialLinks: {
        github?: string;
        linkedin?: string;
    };
    bio: string;
    portfolioUrl: string;
    projects: string[];
};
