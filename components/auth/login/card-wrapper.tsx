"use client";

import { Card, CardContent, CardHeader, CardFooter } from "../../ui/card";
import { BackButton } from "./back-button";
import { Header } from "./header";
import { Social } from "./social";

interface CardWrapperProps {
    children: React.ReactNode;
    headerTitle: string;
    headerSubtitle: string;
    backButtonHref: string;
    backButtonLabel1: string;
    backButtonLabel2:string;
    showSocial?: boolean;
}

export const CardWrapper = ({
    children,
    headerTitle,
    headerSubtitle,
    showSocial,
    backButtonLabel1,
    backButtonLabel2,
    backButtonHref
}: CardWrapperProps) => {
    return (
        <Card className="w-full max-w-md bg-card-foreground shadow-xl rounded-2xl border-none p-6">
            <CardHeader>
                <Header title={headerTitle} subtitle={headerSubtitle} />
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
            {showSocial && (
                <CardFooter className="flex flex-col gap-4">
                    <Social />
                    <BackButton label1={backButtonLabel1} label2={backButtonLabel2} href={backButtonHref} />
                </CardFooter>
            )}
        </Card>
    )
}