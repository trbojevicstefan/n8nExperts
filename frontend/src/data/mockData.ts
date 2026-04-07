export const dashboardData = {
    user: {
        name: "Alex",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0JUYF8ii4j0KyXTbYjSaSLVJOFAizsbytD68qZSCaXeO6-lhFWT9bsEIwXNQzHDxbIwqdRfuqQBdFNqlboVgRJMh7gQwXzoAA--ZJPLv3cs84erPhtUHl9Dmbfs6-EZJPYd2XpnNNUNgH4yP9dTJAQE4bzlu-HGLw3B31az7CrQ0qKEMsZv2-XkgYR7rbAJIQHJo-WhO-wQINV2WhN3HQiMvg6777iueU2mGehwZR6it-HgYgNUutv_LbAXzlbXox3-nUx_lOD1VJ"
    },
    metrics: {
        monthlyEarnings: "$4,500.00",
        growth: "+12% from last month",
        activeProjects: 3,
        successRate: "98%"
    },
    activeProjects: [
        {
            id: 1,
            title: "Custom API Integration",
            client: "FinTech Solutions",
            status: "ON TRACK",
            statusColor: "secondary", // secondary maps to emerald in our classes
            nextMilestone: "Auth Layer",
            progress: 75
        },
        {
            id: 2,
            title: "Shopify Store Optimization",
            client: "Bloom Apparel",
            status: "DUE SOON",
            statusColor: "primary", // maps to pink
            nextMilestone: "Assets Comp.",
            progress: 40
        }
    ],
    recentMessages: [
        {
            id: 1,
            sender: "Sarah Jenkins",
            time: "10m ago",
            preview: "The API documentation looks solid, let's proceed...",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi0Oqvg0mqZE-kbzsptEn8JFHMqHcYaQaW-cIT7DOFfGlaOsW_8PfEimmt5HzsMk5MD01uK5TjhO9zfmEN2X_C9TEpvi7iV4V2-ZbjmkPvwPqqcScy5RcsNqlEBda1eYd_qU0MtpNP-a1OzA_Gj6rRAnVEZNEzlyy3devx9t1uNmcJ4LCCFmH0mj1lHMf1JWdTNQWSsheoLEfhduiI9S1r5eHDZq5Na0_IT-Vr3H2yrUgqTKAoBPTh5m4ZTDwIz161ddBWNi9jml8f",
            online: true
        },
        {
            id: 2,
            sender: "Marcus Chen",
            time: "2h ago",
            preview: "I've uploaded the new branding assets to the folder.",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCVUfT9M3fooLh-aN19ncoU4NpoLyXzDVhRp2OcELMeYrrwHKr_AYQ5iJS-Qx7jy9qniux9P3GSS0V5Hxa_sEGtuAvUwdtKlAErobNdy8uHgLwWUeytFsOJzPKqv32HLYFqDbYAPxlKPV5fQQZUrkQIjM5dbBzhafnvJGcAF99Lgw9bBZRMdzJkL0VLklh_Lg5rU9SxskS1aLH4-knhldT9VOU7LU_DsPdWuuqVI9-7f5jp8y202wvAZNWBgGuniq47H_QLsK-I6Ju",
            online: false
        }
    ]
};
