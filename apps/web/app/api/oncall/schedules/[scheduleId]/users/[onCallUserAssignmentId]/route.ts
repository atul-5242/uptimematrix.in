import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://api.uptimematrix.atulmaurya.in/";

export async function DELETE(req: NextRequest, { params }: { params: { scheduleId: string, onCallUserAssignmentId: string } }) {
  const { scheduleId, onCallUserAssignmentId } = params;
  const token = req.headers.get('Authorization');

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!scheduleId || !onCallUserAssignmentId) {
    return NextResponse.json({ message: 'Schedule ID and On-Call User Assignment ID are required.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/oncall/schedules/${scheduleId}/users/${onCallUserAssignmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      console.error(`Backend responded with status ${response.status}`);
      const errorText = await response.text();
      console.error('Backend response text:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (jsonError) {
        console.error('Failed to parse backend error response as JSON:', jsonError);
        return NextResponse.json({ message: 'Backend error: ' + errorText }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying DELETE /api/oncall/schedules/${scheduleId}/users/${onCallUserAssignmentId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
