"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";
import GetStartedPromo from "../components/get-started-promo";
import ApplicationForm from "@/components/application/application-form";

enum PageState {
  WELCOME = "welcome",
  APPLICATION = "application",
}

export default function Main() {
  const [currentPage, setCurrentPage] = useState<PageState>(PageState.WELCOME);

  const handleGetStarted = () => {
    setCurrentPage(PageState.APPLICATION);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case PageState.WELCOME:
        return <GetStartedPromo onGetStarted={handleGetStarted} />;

      case PageState.APPLICATION:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
              <CardDescription>
                Get started by filling out the form below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationForm formId="application-form" />
            </CardContent>
          </Card>
        );

      default:
        return <GetStartedPromo onGetStarted={handleGetStarted} />;
    }
  };

  return <PageLayout>{renderCurrentPage()}</PageLayout>;
}
