import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Badge} from "../components/ui/badge";

export default function Settings() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account and notification preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive notifications for new tickets</p>
                            </div>
                            <Badge>Enabled</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">SLA Alerts</p>
                                <p className="text-sm text-muted-foreground">Get warned when tickets approach SLA
                                    deadline</p>
                            </div>
                            <Badge>Enabled</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Auto-assignment</p>
                                <p className="text-sm text-muted-foreground">Automatically assign new tickets to you</p>
                            </div>
                            <Badge variant="secondary">Disabled</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

