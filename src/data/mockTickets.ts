import type {Ticket} from "../types/ticket";

export const mockTickets: Ticket[] = [
    {
        id: "T-001",
        title: "Login page not loading properly",
        description: "Users are reporting that the login page takes too long to load and sometimes shows a blank screen. This is affecting multiple users across different browsers.",
        priority: "critical",
        status: "open",
        assignedAgent: "John Smith",
        createdAt: new Date("2024-09-30T09:15:00"),
        updatedAt: new Date("2024-09-30T09:15:00"),
        slaTimeLeft: "2h 15m",
        history: [
            {
                id: "h1",
                timestamp: new Date("2024-09-30T09:15:00"),
                action: "created ticket",
                details: "Ticket created from customer report",
                agent: "System"
            }
        ]
    },
    {
        id: "T-002",
        title: "Email notifications not working",
        description: "Customer reports that they are not receiving email notifications for order confirmations and shipping updates.",
        priority: "high",
        status: "in-progress",
        assignedAgent: "Sarah Wilson",
        createdAt: new Date("2024-09-30T08:30:00"),
        updatedAt: new Date("2024-09-30T10:45:00"),
        slaTimeLeft: "4h 30m",
        history: [
            {
                id: "h2",
                timestamp: new Date("2024-09-30T08:30:00"),
                action: "created ticket",
                details: "Ticket created from customer email",
                agent: "System"
            },
            {
                id: "h3",
                timestamp: new Date("2024-09-30T10:45:00"),
                action: "updated status",
                details: "Changed status from Open to In Progress",
                agent: "Sarah Wilson"
            }
        ]
    },
    {
        id: "T-003",
        title: "Mobile app crashes on startup",
        description: "Several users are experiencing app crashes immediately after opening the mobile application on iOS devices.",
        priority: "high",
        status: "open",
        assignedAgent: "Mike Johnson",
        createdAt: new Date("2024-09-30T07:20:00"),
        updatedAt: new Date("2024-09-30T07:20:00"),
        slaTimeLeft: "6h 45m",
        history: [
            {
                id: "h4",
                timestamp: new Date("2024-09-30T07:20:00"),
                action: "created ticket",
                details: "Ticket created from app store reviews",
                agent: "System"
            }
        ]
    },
    {
        id: "T-004",
        title: "Password reset feature not working",
        description: "Users clicking 'Forgot Password' are not receiving reset emails. The issue seems to be intermittent.",
        priority: "medium",
        status: "in-progress",
        assignedAgent: "Emily Davis",
        createdAt: new Date("2024-09-29T16:45:00"),
        updatedAt: new Date("2024-09-30T09:30:00"),
        slaTimeLeft: "1d 2h",
        history: [
            {
                id: "h5",
                timestamp: new Date("2024-09-29T16:45:00"),
                action: "created ticket",
                details: "Ticket created from multiple customer reports",
                agent: "System"
            },
            {
                id: "h6",
                timestamp: new Date("2024-09-30T09:30:00"),
                action: "added comment",
                details: "Investigating email service provider logs",
                agent: "Emily Davis"
            }
        ]
    },
    {
        id: "T-005",
        title: "Checkout process taking too long",
        description: "Customers are reporting that the checkout process is unusually slow, especially during payment processing.",
        priority: "medium",
        status: "open",
        assignedAgent: "Alex Brown",
        createdAt: new Date("2024-09-29T14:30:00"),
        updatedAt: new Date("2024-09-29T14:30:00"),
        slaTimeLeft: "1d 8h",
        history: [
            {
                id: "h7",
                timestamp: new Date("2024-09-29T14:30:00"),
                action: "created ticket",
                details: "Ticket created from customer feedback",
                agent: "System"
            }
        ]
    },
    {
        id: "T-006",
        title: "Profile picture upload failing",
        description: "Users are unable to upload profile pictures. The upload seems to start but then fails with no error message.",
        priority: "low",
        status: "resolved",
        assignedAgent: "John Smith",
        createdAt: new Date("2024-09-28T11:15:00"),
        updatedAt: new Date("2024-09-29T13:20:00"),
        history: [
            {
                id: "h8",
                timestamp: new Date("2024-09-28T11:15:00"),
                action: "created ticket",
                details: "Ticket created from customer support chat",
                agent: "System"
            },
            {
                id: "h9",
                timestamp: new Date("2024-09-29T10:30:00"),
                action: "updated status",
                details: "Changed status from Open to In Progress",
                agent: "John Smith"
            },
            {
                id: "h10",
                timestamp: new Date("2024-09-29T13:20:00"),
                action: "resolved ticket",
                details: "Fixed file upload size limit issue",
                agent: "John Smith"
            }
        ]
    },
    {
        id: "T-007",
        title: "Search function returning incorrect results",
        description: "The search functionality is returning results that don't match the search query. This is confusing users and affecting their experience.",
        priority: "medium",
        status: "open",
        assignedAgent: "Sarah Wilson",
        createdAt: new Date("2024-09-30T06:00:00"),
        updatedAt: new Date("2024-09-30T06:00:00"),
        slaTimeLeft: "1d 12h",
        history: [
            {
                id: "h11",
                timestamp: new Date("2024-09-30T06:00:00"),
                action: "created ticket",
                details: "Ticket created from user testing feedback",
                agent: "System"
            }
        ]
    },
    {
        id: "T-008",
        title: "Dark mode toggle not saving preference",
        description: "Users report that when they toggle dark mode, the preference is not saved and reverts to light mode on next login.",
        priority: "low",
        status: "open",
        assignedAgent: "Mike Johnson",
        createdAt: new Date("2024-09-29T20:30:00"),
        updatedAt: new Date("2024-09-29T20:30:00"),
        slaTimeLeft: "2d 4h",
        history: [
            {
                id: "h12",
                timestamp: new Date("2024-09-29T20:30:00"),
                action: "created ticket",
                details: "Ticket created from feature request",
                agent: "System"
            }
        ]
    }
];