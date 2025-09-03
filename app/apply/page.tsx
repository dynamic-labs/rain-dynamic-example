import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";
import ApplicationForm from "@/components/application/application-form";

export default function ApplyPage() {
  return (
    <PageLayout>
      <Card>
        <CardHeader>
          <CardTitle>Application</CardTitle>
          <CardDescription>
            Get started by filling out the application below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm formId="apply-form" />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
