'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy } from 'lucide-react';

interface CryptoAddress {
    name: string;
    address: string;
    protocol?: string;
}

const cryptoAddresses: CryptoAddress[] = [
    {
        name: 'Bitcoin',
        address: 'bc1qppjzq8lsd753zat3pn5jy7c6e0fpwwvugpy89l',
        protocol: 'Native Segwit',
    },
    {
        name: 'Ethereum',
        address: '0x00C5D793627c8DCDF2ECbA6382048A2CEEe5D5ED',
    },
    {
        name: 'Solana',
        address: '4abvxRwWukzMUNrgk6kzwt7KhfAXUDYVKj45FEn6EW1k',
    },
];

export default function DonatePage() {
    const { toast } = useToast();

    const handleCopy = (address: string) => {
        navigator.clipboard.writeText(address).then(() => {
            toast({
                title: "Copied to clipboard!",
                description: "The address has been copied successfully.",
            });
        }).catch(err => {
            toast({
                variant: "destructive",
                title: "Failed to copy",
                description: "Could not copy address to clipboard.",
            });
        });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Donate to w3Develops</CardTitle>
                    <CardDescription>
                        Your contributions help us grow our community and continue to provide free learning resources and collaborative opportunities for developers worldwide.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p>
                        We appreciate your support! You can donate to us using the following cryptocurrency addresses.
                    </p>
                    
                    <div className="space-y-4">
                        {cryptoAddresses.map((crypto) => (
                            <div key={crypto.name}>
                                <h3 className="text-lg font-semibold mb-2">{crypto.name} {crypto.protocol && `(${crypto.protocol})`}</h3>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="text" 
                                        readOnly 
                                        value={crypto.address} 
                                        className="font-mono text-sm bg-muted"
                                    />
                                    <Button variant="outline" size="icon" onClick={() => handleCopy(crypto.address)}>
                                        <Copy className="h-4 w-4" />
                                        <span className="sr-only">Copy {crypto.name} address</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 text-sm text-muted-foreground">
                        <p><strong>Disclaimer:</strong> Please ensure you are sending the correct cryptocurrency to the correct address. Transactions are irreversible. Thank you for your generosity!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
